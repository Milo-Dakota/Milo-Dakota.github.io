(() => {
  'use strict';
  const canvas = document.querySelector('#screen');
  const context = canvas.getContext('2d');
  const SIZE = 375;
  const BLOCK = 125;
  const CELL = 40;
  const colors = { paper: '#faf8f2', empty: '#e5e1d9', available: '#eee6f7', hover: '#d9c9ee', purple: '#9475c4', green: '#8fa873', text: '#fffdf8' };
  const lines = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
  let boards, captured, player, next, moves, finished;
  let round = 0;
  let cursor = 0;
  let keyboard = false;
  let hover = -1;
  context.scale(canvas.width / SIZE, canvas.height / SIZE);

  function reset() {
    boards = Array.from({ length: 9 }, () => Array(9).fill(0));
    captured = Array(9).fill(0); // 0 = open, 1/2 = captured, 3 = draw
    player = 1;
    next = -1;
    moves = 0;
    finished = false;
    cursor = 0;
    hover = -1;
    round += 1;
    update();
  }

  function allowed(board, cell) {
    return !finished && captured[board] === 0 && boards[board][cell] === 0 && (next === -1 || next === board);
  }

  function play(board, cell) {
    if (!allowed(board, cell)) return;
    boards[board][cell] = player;
    moves += 1;
    if (lines.some(line => line.every(index => boards[board][index] === player))) captured[board] = player;
    else if (boards[board].every(Boolean)) captured[board] = 3;
    next = captured[cell] === 0 ? cell : -1;
    finished = captured.every(Boolean);
    player = player === 1 ? 2 : 1;
    update();
  }

  function update() {
    const one = captured.filter(value => value === 1).length;
    const two = captured.filter(value => value === 2).length;
    document.querySelector('#score-one').textContent = one;
    document.querySelector('#score-two').textContent = two;
    document.querySelector('#player-one').classList.toggle('is-active', !finished && player === 1);
    document.querySelector('#player-two').classList.toggle('is-active', !finished && player === 2);
    document.querySelector('#move-count').textContent = `ROUND ${String(round).padStart(2, '0')} · ${moves} 步`;
    const status = document.querySelector('#turn-status');
    status.textContent = finished
      ? `✷ 本局结束 · ${one === two ? '势均力敌，平局！' : one > two ? '紫色梦想家获胜！' : '绿色行动派获胜！'}`
      : `${player === 1 ? '✕ 紫色方' : '○ 绿色方'}回合 · ${next === -1 ? '任选一个亮色空格' : `前往第 ${next + 1} 州（从左到右、从上到下）`}`;
    draw();
  }

  function tile(x, y, size, color) {
    context.fillStyle = color;
    context.beginPath();
    context.roundRect(x, y, size, size, size > 40 ? 9 : 4);
    context.fill();
  }

  function symbol(value, x, y, size) {
    context.strokeStyle = colors.text;
    context.lineWidth = size > 40 ? 6 : 2.5;
    context.lineCap = 'round';
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size * .23;
    context.beginPath();
    if (value === 1) {
      context.moveTo(centerX - radius, centerY - radius);
      context.lineTo(centerX + radius, centerY + radius);
      context.moveTo(centerX + radius, centerY - radius);
      context.lineTo(centerX - radius, centerY + radius);
    } else {
      context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    }
    context.stroke();
  }

  function draw() {
    context.clearRect(0, 0, SIZE, SIZE);
    for (let board = 0; board < 9; board += 1) {
      const bx = (board % 3) * BLOCK;
      const by = Math.floor(board / 3) * BLOCK;
      if (captured[board] === 1 || captured[board] === 2) {
        tile(bx + 1, by + 1, 119, captured[board] === 1 ? colors.purple : colors.green);
        symbol(captured[board], bx + 1, by + 1, 119);
        continue;
      }
      for (let cell = 0; cell < 9; cell += 1) {
        const x = bx + (cell % 3) * CELL + 1;
        const y = by + Math.floor(cell / 3) * CELL + 1;
        const value = boards[board][cell];
        const id = board * 9 + cell;
        const fill = value ? (value === 1 ? colors.purple : colors.green) : allowed(board, cell) ? (hover === id ? colors.hover : colors.available) : colors.empty;
        tile(x, y, 37, fill);
        if (value) symbol(value, x, y, 37);
        if (keyboard && cursor === id) {
          context.strokeStyle = '#51406b';
          context.lineWidth = 2;
          context.strokeRect(x + 2, y + 2, 33, 33);
        }
      }
    }
  }

  function hit(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * SIZE / rect.width;
    const y = (event.clientY - rect.top) * SIZE / rect.height;
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return null;
    const bx = Math.floor(x / BLOCK);
    const by = Math.floor(y / BLOCK);
    const lx = x % BLOCK;
    const ly = y % BLOCK;
    if (lx >= 120 || ly >= 120) return null;
    return [by * 3 + bx, Math.floor(ly / CELL) * 3 + Math.floor(lx / CELL)];
  }

  canvas.addEventListener('pointermove', event => {
    const target = hit(event);
    hover = target ? target[0] * 9 + target[1] : -1;
    draw();
  });
  canvas.addEventListener('pointerleave', () => { hover = -1; draw(); });
  canvas.addEventListener('click', event => {
    keyboard = false;
    const target = hit(event);
    if (target) { cursor = target[0] * 9 + target[1]; play(...target); }
  });
  canvas.addEventListener('keydown', event => {
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (!directions[event.key] && event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    keyboard = true;
    const board = Math.floor(cursor / 9);
    const cell = cursor % 9;
    if (directions[event.key]) {
      const [dx, dy] = directions[event.key];
      const x = ((board % 3) * 3 + cell % 3 + dx + 9) % 9;
      const y = (Math.floor(board / 3) * 3 + Math.floor(cell / 3) + dy + 9) % 9;
      cursor = (Math.floor(y / 3) * 3 + Math.floor(x / 3)) * 9 + (y % 3) * 3 + x % 3;
      draw();
    } else play(board, cell);
  });
  canvas.addEventListener('blur', () => { keyboard = false; draw(); });
  document.querySelector('#restart').addEventListener('click', reset);
  reset();
})();
