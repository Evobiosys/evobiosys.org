/* newsletter.js - shared subscribe-form handler
 *
 * Markup contract:
 *   <form class="newsletter-form">
 *     <input type="email" name="email" required>
 *     <button type="submit">Subscribe</button>
 *   </form>
 *   <p class="newsletter-msg" aria-live="polite"></p>   inline status message
 *
 * Behaviour:
 *   - Wires every form.newsletter-form on the page to the subscriber service.
 *   - POSTs {email, project, source, gdpr} as JSON, no external dependencies.
 *   - Disables the submit button while the request is in flight.
 *   - Reports confirmation_sent / confirmation_pending / already_subscribed /
 *     network-or-HTTP-error inline via the adjacent .newsletter-msg element.
 *     Never uses alert(). If .newsletter-msg is missing, fails silently.
 *   - No JS -> the form has no action/method, so a plain submit is a harmless
 *     no-op (no fake success is ever shown).
 *
 * No dependencies. Idempotent: safe to load multiple times.
 */
(function () {
  'use strict';

  var ENDPOINT = 'https://subscriber.evobiosys.org/subscribe';
  var PROJECT = 'evobiosys';

  var MESSAGES = {
    confirmation_sent: 'Almost there — check your inbox to confirm.',
    confirmation_pending: 'Almost there — check your inbox to confirm.',
    already_subscribed: "You're already on the list.",
    error: 'Subscription service is briefly unavailable — please try again later.'
  };

  function setMessage(msgEl, text, kind) {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.classList.remove('is-error', 'is-success');
    if (kind) msgEl.classList.add(kind);
  }

  function setupForm(form) {
    var email = form.querySelector('input[type="email"]');
    var button = form.querySelector('button[type="submit"]');
    var msgEl = form.parentNode ? form.parentNode.querySelector('.newsletter-msg') : null;
    if (!email || !button) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = email.value.trim();
      if (!value) return;

      var originalLabel = button.textContent;
      button.disabled = true;
      button.textContent = 'Subscribing…';
      setMessage(msgEl, '', null);

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: value,
          project: PROJECT,
          source: window.location.pathname,
          gdpr: true
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('http_' + res.status);
          return res.json();
        })
        .then(function (data) {
          button.disabled = false;
          button.textContent = originalLabel;
          var status = data && data.status;
          if (status === 'already_subscribed') {
            setMessage(msgEl, MESSAGES.already_subscribed, 'is-success');
          } else {
            email.value = '';
            setMessage(msgEl, MESSAGES.confirmation_sent, 'is-success');
          }
        })
        .catch(function () {
          button.disabled = false;
          button.textContent = originalLabel;
          setMessage(msgEl, MESSAGES.error, 'is-error');
        });
    });
  }

  function init() {
    var forms = document.querySelectorAll('form.newsletter-form');
    forms.forEach(setupForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
