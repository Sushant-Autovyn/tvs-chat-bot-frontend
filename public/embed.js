/*!
 * TVS Support Chatbot — Embeddable Widget Loader
 * Usage:
 *   <script src="https://tvs-chat-bot-frontend.vercel.app/embed.js" defer></script>
 *
 * Drops a floating support-chat button into the bottom-right of any page.
 * The chatbot UI is rendered inside a sandboxed iframe so it cannot
 * conflict with the host page's CSS or JavaScript.
 */
(function () {
  'use strict';

  // Guard against double-injection (e.g. script included twice)
  if (window.__tvsChatbotLoaded) return;
  window.__tvsChatbotLoaded = true;

  // ── Resolve the chatbot base URL from this script's own src ──
  // This makes the loader portable: deploy embed.js next to the app
  // and it will always point to the correct origin.
  var currentScript =
    document.currentScript ||
    (function () {
      var s = document.getElementsByTagName('script');
      return s[s.length - 1];
    })();

  var scriptSrc = (currentScript && currentScript.src) || '';
  var baseUrl = scriptSrc.replace(/\/embed\.js(\?.*)?$/, '/') ||
                'https://tvs-chat-bot-frontend.vercel.app/';

  // ── Iframe size presets ──
  // Closed: just enough room to show the floating button.
  // Open:   fits the full chat window (380px wide × 600px tall + margins).
  var CLOSED_STYLE =
    'position:fixed;bottom:0;right:0;width:120px;height:120px;' +
    'border:0;background:transparent;z-index:2147483647;' +
    'color-scheme:normal;transition:width .25s ease,height .25s ease;';

  var OPEN_STYLE =
    'position:fixed;bottom:0;right:0;width:430px;height:740px;' +
    'max-width:100vw;max-height:100vh;' +
    'border:0;background:transparent;z-index:2147483647;' +
    'color-scheme:normal;transition:width .25s ease,height .25s ease;';

  // ── Create the iframe ──
  var iframe = document.createElement('iframe');
  iframe.id = 'tvs-chatbot-iframe';
  iframe.title = 'TVS Support Chat';
  iframe.src = baseUrl;
  iframe.allow = 'clipboard-write';
  iframe.setAttribute('allowtransparency', 'true');
  iframe.setAttribute('aria-label', 'TVS Support Chat');
  iframe.setAttribute('style', CLOSED_STYLE);

  // ── Listen for open/close events posted by the Angular app ──
  window.addEventListener('message', function (event) {
    var data = event && event.data;
    if (!data || data.source !== 'tvs-chatbot') return;

    if (data.state === 'open') {
      iframe.setAttribute('style', OPEN_STYLE);
    } else if (data.state === 'closed') {
      iframe.setAttribute('style', CLOSED_STYLE);
    }
  });

  // ── Inject into the page as soon as <body> is available ──
  function inject() {
    if (document.body) {
      document.body.appendChild(iframe);
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        document.body.appendChild(iframe);
      });
    }
  }
  inject();
})();
