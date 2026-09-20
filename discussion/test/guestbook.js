(() => {
  'use strict';
  const prompts = [
    '最近有什么小事，让你突然觉得生活还不错？',
    '如果今天可以拥有一个没什么用的超能力，你想要什么？',
    '推荐一首适合在夜里循环播放的歌吧。',
    '你在互联网最意外的角落，发现过什么宝藏？',
    '给未来路过这里的人，留一句话吧。',
    '今天的心情，如果用一道菜来形容，会是什么？'
  ];
  let current = 0;
  const button = document.querySelector('#shuffle-prompt');
  const prompt = document.querySelector('#writing-prompt');
  prompt.setAttribute('aria-live', 'polite');
  button.hidden = false;
  button.addEventListener('click', () => {
    current = (current + 1 + Math.floor(Math.random() * (prompts.length - 1))) % prompts.length;
    prompt.textContent = prompts[current];
  });
  // Keep a useful fallback even when the third-party comment service cannot load.
  window.addEventListener('message', (event) => {
    const frame = document.querySelector('iframe.giscus-frame');
    if (event.origin !== 'https://giscus.app' || event.source !== frame?.contentWindow) return;
    if (event.data?.giscus?.resizeHeight > 0) {
      const help = document.querySelector('#comment-help');
      help.firstChild.textContent = '喜欢直接串门？也可以';
    }
  });
})();
