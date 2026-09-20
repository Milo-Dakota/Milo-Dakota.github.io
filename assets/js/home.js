/* Independent enhancements. Add data-explore to internal destinations to
 * include them in the random explorer. No build step or dependencies. */
(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toast = document.querySelector('#toast');
  let toastTimeout;

  function showToast(message) {
    clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 3200);
  }

  function celebrate(element) {
    if (reducedMotion.matches) return;
    const rect = element.getBoundingClientRect();
    const layer = document.querySelector('#confetti-layer');
    const colors = ['#947acb', '#e6b348', '#91a66d', '#d7947d'];
    for (let i = 0; i < 14; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'confetti';
      piece.textContent = i % 2 ? '✦' : '·';
      // Runtime positions only; visual rules live in interactions.css.
      piece.style.left = `${rect.left + rect.width / 2}px`;
      piece.style.top = `${rect.top + rect.height / 2}px`;
      piece.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 300}px`);
      piece.style.setProperty('--drift-y', `${(Math.random() - 0.7) * 240}px`);
      piece.style.setProperty('--spin', `${(Math.random() - 0.5) * 280}deg`);
      piece.style.setProperty('--confetti-color', colors[i % colors.length]);
      layer.append(piece);
      piece.addEventListener('animationend', () => piece.remove(), { once: true });
      setTimeout(() => piece.remove(), 1200);
    }
  }

  function initStar() {
    const button = document.querySelector('#star-button');
    if (!button) return;
    let count = 0;
    try {
      const saved = Number(localStorage.getItem('milo:stars'));
      if (Number.isSafeInteger(saved) && saved > 0) count = saved;
    } catch { /* Collecting works even without local storage. */ }
    button.disabled = false;
    button.addEventListener('click', () => {
      count += 1;
      try { localStorage.setItem('milo:stars', String(count)); } catch { /* Optional persistence. */ }
      const messages = ['捡到一颗小星星，今天也要闪闪发光。', '宇宙说：偶尔发呆，也是正经事。', '这颗星星没有 KPI，只有一点点快乐。', '你发现了一个没什么用、但很开心的按钮。'];
      showToast(count % 5 === 0 ? `★ 已收集 ${count} 颗星星，授予你「宇宙闲逛家」称号！` : `★ ${messages[(count - 1) % messages.length]}（${count}）`);
      celebrate(button);
    });
  }

  function initExplorer() {
    const button = document.querySelector('#random-explore');
    const destinations = [...document.querySelectorAll('a[data-explore]')];
    if (!button || !destinations.length) return;
    button.hidden = false;
    button.addEventListener('click', () => {
      const destination = destinations[Math.floor(Math.random() * destinations.length)];
      window.location.assign(destination.href);
    });
  }

  document.querySelector('#current-year').textContent = new Date().getFullYear();
  document.querySelector('#back-to-top').addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    document.querySelector('.wordmark').focus({ preventScroll: true });
  });
  initStar();
  initExplorer();
})();
