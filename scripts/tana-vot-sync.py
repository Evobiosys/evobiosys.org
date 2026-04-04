#!/usr/bin/env python3
"""
tana-vot-sync.py — Version of Truth sync from Tana MCP to Jekyll _data/

Connects to the local Tana MCP server, reads watched nodes, compares
against last-known state, and writes _data/*.yml + git commit/push on change.

Zero token cost — just HTTP calls to localhost MCP.

Usage:
    python3 tana-vot-sync.py                  # one-shot sync
    python3 tana-vot-sync.py --watch 300      # poll every 5 minutes
    python3 tana-vot-sync.py --dry-run        # show what would change

Cron example (every 5 min):
    */5 * * * * cd /root/projects/evobiosys.org && python3 scripts/tana-vot-sync.py >> /var/log/tana-vot-sync.log 2>&1
"""

import json
import hashlib
import subprocess
import sys
import time
import argparse
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError

# ============================================================
# Configuration — edit these
# ============================================================

import os
MCP_URL = os.environ.get("TANA_MCP_URL", "http://127.0.0.1:8262")
MCP_TOKEN = os.environ.get("TANA_MCP_TOKEN", "")

REPO_ROOT = Path(__file__).resolve().parent.parent  # evobiosys.org/
DATA_DIR = REPO_ROOT / "_data"
STATE_DIR = REPO_ROOT / "scripts" / ".sync-state"

# Watched nodes: each maps a Tana node ID to a _data/ YAML file
# The script reads the node's children and converts them to YAML
WATCHED_NODES = {
    # VoT root — children are the sources of truth
    "asxaB7PxoxaM": {
        "output": "vot.yml",
        "depth": 2,
        "description": "VoT root node"
    },
    # Add more watched nodes here:
    # "nodeId": {"output": "filename.yml", "depth": 2, "description": "..."},
}

GIT_AUTO_COMMIT = True
GIT_AUTO_PUSH = True
GIT_COMMIT_MSG_PREFIX = "sync: VoT update from Tana"


# ============================================================
# MCP Client — talks to local Tana MCP via JSON-RPC
# ============================================================

class TanaMCPClient:
    """Minimal JSON-RPC client for Tana local MCP."""

    def __init__(self, base_url: str, token: str = ""):
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.request_id = 0

    def call(self, method: str, params: dict = None) -> dict:
        """Send a JSON-RPC call to the MCP server."""
        self.request_id += 1
        payload = {
            "jsonrpc": "2.0",
            "id": self.request_id,
            "method": "tools/call",
            "params": {
                "name": method,
                "arguments": params or {}
            }
        }
        data = json.dumps(payload).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
        }
        if hasattr(self, 'token') and self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        req = Request(
            f"{self.base_url}/mcp",
            data=data,
            headers=headers,
            method="POST"
        )
        try:
            with urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read())
                if "error" in result:
                    print(f"  MCP error: {result['error']}", file=sys.stderr)
                    return None
                # Extract text content from MCP response
                content = result.get("result", {}).get("content", [])
                for item in content:
                    if item.get("type") == "text":
                        return item.get("text", "")
                return content
        except URLError as e:
            print(f"  Cannot reach MCP at {self.base_url}: {e}", file=sys.stderr)
            return None

    def read_node(self, node_id: str, max_depth: int = 2) -> str:
        """Read a node and its children as markdown."""
        return self.call("read_node", {
            "nodeId": node_id,
            "maxDepth": max_depth
        })

    def get_children(self, node_id: str, limit: int = 200) -> str:
        """Get paginated children of a node."""
        return self.call("get_children", {
            "nodeId": node_id,
            "limit": limit
        })

    def search_nodes(self, query: dict, limit: int = 50) -> str:
        """Search for nodes."""
        return self.call("search_nodes", {
            "query": query,
            "limit": limit
        })


# ============================================================
# State management — track what we last synced
# ============================================================

def get_content_hash(content: str) -> str:
    """SHA256 hash of content for diff detection."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def load_last_hash(node_id: str) -> str:
    """Load the last-known hash for a node."""
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    hash_file = STATE_DIR / f"{node_id}.hash"
    if hash_file.exists():
        return hash_file.read_text().strip()
    return ""


def save_hash(node_id: str, content_hash: str):
    """Save the current hash for a node."""
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    hash_file = STATE_DIR / f"{node_id}.hash"
    hash_file.write_text(content_hash)


# ============================================================
# YAML conversion — Tana markdown → YAML
# ============================================================

def tana_markdown_to_yaml(markdown: str, node_id: str) -> str:
    """
    Convert Tana node markdown to a simple YAML structure.
    This is a basic converter — extend as needed for your data shape.
    """
    lines = []
    lines.append(f"# Auto-synced from Tana node {node_id}")
    lines.append(f"# Last sync: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
    lines.append(f"# Do not edit — changes will be overwritten by next sync")
    lines.append("")
    lines.append("entries:")

    # Parse the markdown into a flat list of entries
    if not markdown:
        return "\n".join(lines) + "\n"

    for line in markdown.split("\n"):
        stripped = line.strip()
        if stripped.startswith("- ") and not stripped.startswith("- *["):
            # Count indentation level
            indent = len(line) - len(line.lstrip())
            level = indent // 2
            name = stripped[2:].strip()

            # Remove HTML tags and node-id comments
            import re
            name = re.sub(r'<!--.*?-->', '', name).strip()
            name = re.sub(r'#\w+', '', name).strip()  # Remove tags
            name = re.sub(r'\*\*.*?\*\*:?\s*', '', name).strip()  # Remove bold fields

            if name and not name.startswith("*["):
                yaml_indent = "  " * (level + 1)
                lines.append(f"{yaml_indent}- name: \"{name}\"")
                lines.append(f"{yaml_indent}  level: {level}")

    return "\n".join(lines) + "\n"


# ============================================================
# Git operations
# ============================================================

def git_has_changes() -> bool:
    """Check if there are uncommitted changes in _data/."""
    result = subprocess.run(
        ["git", "diff", "--name-only", "_data/"],
        capture_output=True, text=True, cwd=REPO_ROOT
    )
    return bool(result.stdout.strip())


def git_commit_and_push(changed_files: list[str]):
    """Stage, commit, and optionally push changes."""
    for f in changed_files:
        subprocess.run(["git", "add", f], cwd=REPO_ROOT, check=True)

    msg = f"{GIT_COMMIT_MSG_PREFIX}\n\nUpdated: {', '.join(changed_files)}"
    subprocess.run(
        ["git", "commit", "-m", msg],
        cwd=REPO_ROOT, check=True
    )
    print(f"  Committed: {msg.splitlines()[0]}")

    if GIT_AUTO_PUSH:
        subprocess.run(
            ["git", "push", "origin", "main"],
            cwd=REPO_ROOT, check=True
        )
        print("  Pushed to origin/main")


# ============================================================
# Main sync loop
# ============================================================

def sync_once(dry_run: bool = False) -> bool:
    """Run one sync cycle. Returns True if changes were made."""
    if not WATCHED_NODES:
        print("No watched nodes configured. Edit WATCHED_NODES in the script.")
        print("Example:")
        print('  WATCHED_NODES = {')
        print('      "asxaB7PxoxaM": {')
        print('          "output": "vot.yml",')
        print('          "depth": 2,')
        print('          "description": "VoT root node"')
        print('      }')
        print('  }')
        return False

    client = TanaMCPClient(MCP_URL, MCP_TOKEN)
    changed_files = []

    for node_id, config in WATCHED_NODES.items():
        output_file = config["output"]
        depth = config.get("depth", 2)
        desc = config.get("description", node_id)

        print(f"Checking: {desc} ({node_id}) → _data/{output_file}")

        # Read current state from Tana
        content = client.read_node(node_id, max_depth=depth)
        if content is None:
            print(f"  Skipping — could not read node")
            continue

        # Check for changes
        current_hash = get_content_hash(content)
        last_hash = load_last_hash(node_id)

        if current_hash == last_hash:
            print(f"  No changes")
            continue

        print(f"  Change detected! (hash {last_hash[:8]}→{current_hash[:8]})")

        if dry_run:
            print(f"  [DRY RUN] Would write _data/{output_file}")
            continue

        # Convert and write
        yaml_content = tana_markdown_to_yaml(content, node_id)
        output_path = DATA_DIR / output_file
        output_path.write_text(yaml_content)
        print(f"  Wrote _data/{output_file}")

        # Update state
        save_hash(node_id, current_hash)
        changed_files.append(f"_data/{output_file}")

    # Git commit if changes
    if changed_files and GIT_AUTO_COMMIT and not dry_run:
        git_commit_and_push(changed_files)
        return True

    return bool(changed_files)


def main():
    parser = argparse.ArgumentParser(description="Tana VoT → Jekyll _data/ sync")
    parser.add_argument("--watch", type=int, metavar="SECONDS",
                        help="Poll interval in seconds (omit for one-shot)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show what would change without writing")
    args = parser.parse_args()

    print(f"tana-vot-sync — repo: {REPO_ROOT}")
    print(f"MCP endpoint: {MCP_URL}")
    print(f"Watched nodes: {len(WATCHED_NODES)}")
    print()

    if args.watch:
        print(f"Watching every {args.watch}s (Ctrl+C to stop)\n")
        while True:
            try:
                sync_once(dry_run=args.dry_run)
                time.sleep(args.watch)
            except KeyboardInterrupt:
                print("\nStopped.")
                break
    else:
        sync_once(dry_run=args.dry_run)


if __name__ == "__main__":
    main()
