(() => {
  "use strict";

  const canvas = document.getElementById("screen");
  const screen = canvas.getContext("2d");

  const COLOR_EMPTY = "rgb(160,160,160)";
  const COLOR_P1 = "rgb(100,200,200)";
  const COLOR_P2 = "rgb(200,100,200)";
  const COLOR_HIGHLIGHT = "rgb(200,200,200)";

  const CELL_SIZE = 40;
  let next_state = [-1, -1];
  const state_captured = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  let player = 1;
  const map = Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => 0))
    )
  );

  function doDrawMap(mouse_pos) {
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        if (state_captured[a][b] !== 0) {
          screen.fillStyle = state_captured[a][b] === 1 ? COLOR_P1 : COLOR_P2;
          screen.fillRect(b * 125 + 1, a * 125 + 1, 119, 119);
          continue;
        }
        for (let c = 0; c < 3; c++) {
          for (let d = 0; d < 3; d++) {
            if (map[a][b][c][d] === 0) {
              if (
                next_state[0] === -1 ||
                (next_state[0] === a && next_state[1] === b)
              ) {
                if (
                  d * 40 + b * 125 + 1 < mouse_pos[0] &&
                  mouse_pos[0] < d * 40 + b * 125 + 41 &&
                  c * 40 + a * 125 + 1 < mouse_pos[1] &&
                  mouse_pos[1] < c * 40 + a * 125 + 41
                ) {
                  screen.fillStyle = COLOR_EMPTY;
                } else {
                  screen.fillStyle = COLOR_HIGHLIGHT;
                }
              } else {
                screen.fillStyle = COLOR_EMPTY;
              }
            } else {
              screen.fillStyle = map[a][b][c][d] === 1 ? COLOR_P1 : COLOR_P2;
            }
            screen.fillRect(d * 40 + b * 125 + 1, c * 40 + a * 125 + 1, 38, 38);
          }
        }
      }
    }
  }

  function requestDrawMap(mouse_pos) {
    requestAnimationFrame(() => {
      doDrawMap(mouse_pos);
    });
  }

  function simulate(i, j, k, l, player) {
    const MOVES = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ];
    let x;
    let ck, cl;
    for (x = 0; x < 8; x++) {
      ck = k + MOVES[x][0];
      cl = l + MOVES[x][1];
      if (0 <= ck && ck < 3 && 0 <= cl && cl < 3) {
        if (map[i][j][ck][cl] === player) {
          ck = ck + MOVES[x][0];
          cl = cl + MOVES[x][1];
          if (0 <= ck && ck < 3 && 0 <= cl && cl < 3) {
            if (map[i][j][ck][cl] === player) {
              return true;
            }
          } else {
            ck = k - MOVES[x][0];
            cl = l - MOVES[x][1];
            if (0 <= ck && ck < 3 && 0 <= cl && cl < 3) {
              if (map[i][j][ck][cl] === player) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  function mousemove(event) {
    let mouse_pos = [event.offsetX, event.offsetY];
    requestDrawMap(mouse_pos);
  }

  function mouseclick(event) {
    let mouse_pos = [event.offsetX, event.offsetY];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          for (let l = 0; l < 3; l++) {
            if (
              l * 40 + j * 125 + 1 < mouse_pos[0] &&
              mouse_pos[0] < l * 40 + j * 125 + 41 &&
              k * 40 + i * 125 + 1 < mouse_pos[1] &&
              mouse_pos[1] < k * 40 + i * 125 + 41
            ) {
              if (
                next_state[0] === -1 ||
                (next_state[0] === i && next_state[1] === j)
              ) {
                if (map[i][j][k][l] === 0) {
                  map[i][j][k][l] = player;
                  if (simulate(i, j, k, l, player)) {
                    state_captured[i][j] = player;
                  }
                  player = -player;
                  if (state_captured[k][l] !== 0) {
                    next_state = [-1, -1];
                  } else {
                    next_state = [k, l];
                  }
                }
              }
              requestDrawMap(mouse_pos);
              return;
            }
          }
        }
      }
    }
  }

  requestDrawMap([-1, -1]);
  canvas.addEventListener("mousemove", mousemove);
  canvas.addEventListener("mousedown", mouseclick);
})();
