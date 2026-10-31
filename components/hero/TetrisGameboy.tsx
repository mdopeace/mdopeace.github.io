"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import {
  createEngine,
  getGhostCells,
  getPieceCells,
  getPiecePreview,
  isClearing,
  isFinished,
  isGameOver,
  isMenu,
  isPaused,
  isPlaying,
  VISIBLE_HEIGHT,
  VISIBLE_TOP,
  type Engine,
  type PieceKind,
} from "tetris-toolkit";

type GameCell = { kind: PieceKind | null; ghost: boolean };

function visibleBoard(
  engine: Engine,
  board: readonly (readonly (PieceKind | null)[])[],
  active: ReturnType<Engine["getSnapshot"]>["active"],
) {
  const rows: GameCell[][] = board
    .slice(VISIBLE_TOP, VISIBLE_TOP + VISIBLE_HEIGHT)
    .map((row) => row.map((kind) => ({ kind, ghost: false })));
  const state = engine.getSnapshot();

  if (active) {
    for (const [x, y] of getGhostCells(state)) {
      const row = y - VISIBLE_TOP;
      if (
        row >= 0 &&
        row < VISIBLE_HEIGHT &&
        x >= 0 &&
        x < 10 &&
        !rows[row][x].kind
      ) {
        rows[row][x] = { kind: active.kind, ghost: true };
      }
    }
    for (const [x, y] of getPieceCells(
      active.kind,
      active.rotation,
      active.x,
      active.y,
    )) {
      const row = y - VISIBLE_TOP;
      if (row >= 0 && row < VISIBLE_HEIGHT && x >= 0 && x < 10) {
        rows[row][x] = { kind: active.kind, ghost: false };
      }
    }
  }
  return rows;
}

export default function TetrisGameboy() {
  const [engine] = useState(() => createEngine());
  const gameboyRef = useRef<HTMLElement>(null);
  const heldKeys = useRef(new Set<string>());
  const [announcement, setAnnouncement] = useState(
    "Pocket Tetris is ready. Focus the game and press Enter to start.",
  );
  const subscribe = useCallback(
    (listener: () => void) => engine.subscribe(listener),
    [engine],
  );
  const getSnapshot = useCallback(() => engine.getSnapshot(), [engine]);
  const game = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const board = visibleBoard(engine, game.board, game.active);
  const nextType = game.queue[0] ?? "T";
  const preview = getPiecePreview(nextType);
  const ready = isMenu(game);
  const paused = isPaused(game);
  const ended = isGameOver(game) || isFinished(game);
  const countingDown = game.phase.kind === "countdown";
  const running =
    isPlaying(game) || isClearing(game) || game.phase.kind === "countdown";
  const stateActive = isPlaying(game);
  const ledState = paused ? "paused" : running ? "playing" : "default";

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      engine.tick(now - previous);
      previous = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [engine, running]);

  useEffect(() => () => engine.destroy(), [engine]);

  useEffect(() => {
    const unsubscribe = [
      engine.on("pause", () =>
        setAnnouncement(
          "Game paused. Press Enter or the Start button to resume.",
        ),
      ),
      engine.on("resume", () => setAnnouncement("Game resumed.")),
      engine.on("reset", () =>
        setAnnouncement("New game started. Use the arrow keys to play."),
      ),
      engine.on("gameOver", () =>
        setAnnouncement("Game over. Start a new game to play again."),
      ),
      engine.on("lineClear", (clear) =>
        setAnnouncement(
          `${clear.lines} line${clear.lines === 1 ? "" : "s"} cleared. ${clear.points} points earned.`,
        ),
      ),
    ];
    return () => unsubscribe.forEach((stop) => stop());
  }, [engine]);

  function start() {
    const seed = window.crypto.getRandomValues(new Uint32Array(1))[0];
    engine.startGame({ mode: "marathon", seed });
    setAnnouncement("Game starting. Controls unlock in a moment.");
    gameboyRef.current?.focus({ preventScroll: true });
  }

  // The toolkit queues inputs until tick(). While paused, the animation loop
  // is stopped, so explicitly flush resume/reset inputs to avoid deadlocking.
  function flushEngineInput() {
    engine.tick(0);
  }

  function releaseDirectionalKey(code: string) {
    if (!heldKeys.current.delete(code)) return;
    if (code === "ArrowLeft") engine.releaseMoveLeft();
    if (code === "ArrowRight") engine.releaseMoveRight();
    if (code === "ArrowDown") engine.releaseSoftDrop();
  }

  function releaseAllDirectionalKeys() {
    releaseDirectionalKey("ArrowLeft");
    releaseDirectionalKey("ArrowRight");
    releaseDirectionalKey("ArrowDown");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    const target = event.target;
    const nativeButtonActivation =
      target instanceof HTMLElement &&
      target.closest("button") &&
      (event.key === "Enter" || event.code === "Space");
    if (nativeButtonActivation) return;

    const key = event.key.toLowerCase();
    if (event.key.startsWith("Arrow") || event.code === "Space")
      event.preventDefault();
    if (event.repeat) return;

    if ((ready || ended) && event.key === "Enter") {
      start();
      return;
    }
    if (paused && event.key === "Enter") {
      engine.resume();
      flushEngineInput();
      return;
    }
    if (key === "p" && stateActive) {
      releaseAllDirectionalKeys();
      engine.pause();
      return;
    }
    if (!stateActive) return;

    switch (event.code) {
      case "ArrowLeft":
        heldKeys.current.add(event.code);
        engine.moveLeft();
        break;
      case "ArrowRight":
        heldKeys.current.add(event.code);
        engine.moveRight();
        break;
      case "ArrowDown":
        heldKeys.current.add(event.code);
        engine.softDrop();
        break;
      case "ArrowUp":
        engine.rotate("cw");
        break;
      case "Space":
        engine.hardDrop();
        break;
      case "KeyX":
        engine.rotate("cw");
        break;
      case "KeyZ":
        engine.rotate("ccw");
        break;
      case "ShiftLeft":
      case "KeyC":
        engine.hold();
        break;
    }
  }

  function tapMove(direction: "left" | "right" | "down") {
    if (direction === "left") {
      engine.moveLeft();
      engine.releaseMoveLeft();
    } else if (direction === "right") {
      engine.moveRight();
      engine.releaseMoveRight();
    } else {
      engine.softDrop();
      window.setTimeout(() => engine.releaseSoftDrop(), 110);
    }
  }

  useEffect(() => {
    function handleWindowKeyUp(event: globalThis.KeyboardEvent) {
      if (!heldKeys.current.has(event.code)) return;
      if (event.code === "ArrowLeft") engine.releaseMoveLeft();
      if (event.code === "ArrowRight") engine.releaseMoveRight();
      if (event.code === "ArrowDown") engine.releaseSoftDrop();
      heldKeys.current.delete(event.code);
    }

    function releaseAllKeys() {
      engine.releaseMoveLeft();
      engine.releaseMoveRight();
      engine.releaseSoftDrop();
      heldKeys.current.clear();
    }

    window.addEventListener("keyup", handleWindowKeyUp);
    window.addEventListener("blur", releaseAllKeys);
    return () => {
      window.removeEventListener("keyup", handleWindowKeyUp);
      window.removeEventListener("blur", releaseAllKeys);
      releaseAllKeys();
    };
  }, [engine]);

  function activateDirectionalButton(direction: "left" | "right" | "down") {
    tapMove(direction);
  }

  function togglePause() {
    if (paused) {
      engine.resume();
      flushEngineInput();
    } else if (isPlaying(game)) {
      releaseAllDirectionalKeys();
      engine.pause();
    } else if (ready || ended) start();
  }

  const overlayTitle = ready
    ? "READY?"
    : countingDown
      ? "GET READY"
      : paused
        ? "PAUSED"
        : ended
          ? isGameOver(game)
            ? "GAME OVER"
            : "NICE RUN!"
          : null;
  const overlayButton = ready
    ? "START GAME"
    : paused
      ? "RESUME"
      : ended
        ? "PLAY AGAIN"
        : null;

  return (
    <section
      ref={gameboyRef}
      className="gameboy"
      role="region"
      aria-label="Pocket Tetris game"
      aria-describedby="gameboy-instructions"
      aria-keyshortcuts="ArrowLeft ArrowRight ArrowDown ArrowUp Space Enter X Z C P"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="gameboy-brand">
        <span aria-hidden="true">GB</span>
        <span>
          POCKET <i>COLOR</i>
        </span>
        <span
          className={`gameboy-led gameboy-led--${ledState}`}
          aria-hidden="true"
        />
      </div>
      <div className="gameboy-bezel">
        <div className="gameboy-screen">
          <div className="gameboy-screen-heading">
            <span>POCKET TETRIS</span>
            <span>MARATHON</span>
          </div>
          <div className="tetris-screen-layout">
            <div
              className="tetris-board"
              role="group"
              aria-label={`Tetris playfield. Score ${game.score}, ${game.lines} lines cleared, level ${game.level}`}
            >
              {board.flatMap((row, y) =>
                row.map((cell, x) => (
                  <span
                    key={`${x}-${y}`}
                    className={`tetris-cell${cell.kind ? ` tetris-cell--${cell.kind}` : ""}${cell.ghost ? " tetris-cell--ghost" : ""}`}
                    aria-hidden="true"
                  />
                )),
              )}
            </div>
            <aside className="tetris-hud" aria-label="Game stats">
              <div>
                <span>SCORE</span>
                <strong>{game.score.toString().padStart(5, "0")}</strong>
              </div>
              <div>
                <span>LINES</span>
                <strong>{game.lines.toString().padStart(2, "0")}</strong>
              </div>
              <div>
                <span>LEVEL</span>
                <strong>{game.level.toString().padStart(2, "0")}</strong>
              </div>
              <div>
                <span>NEXT</span>
                <div className="tetris-preview">
                  {Array.from({ length: 16 }, (_, index) => {
                    const x = index % 4;
                    const y = Math.floor(index / 4);
                    const filled = preview.cells.some(
                      ([cx, cy]) =>
                        cx - preview.minX === x && cy - preview.minY === y,
                    );
                    return (
                      <i
                        key={index}
                        className={filled ? `tetris-cell--${nextType}` : ""}
                      />
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
          {overlayTitle ? (
            <div className="tetris-overlay">
              <strong>{overlayTitle}</strong>
              {overlayButton ? (
                <button
                  type="button"
                  className={`tetris-screen-button${ready ? " tetris-screen-button--start" : ""}`}
                  onClick={
                    paused
                      ? () => {
                          engine.resume();
                          flushEngineInput();
                        }
                      : start
                  }
                >
                  {overlayButton}
                </button>
              ) : (
                <span className="tetris-countdown-note">
                  Controls unlock in a moment
                </span>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <div className="gameboy-hinge">
        <span>PIXEL POWER · 8-BIT DAYDREAM</span>
      </div>
      <div className="gameboy-controls" role="group" aria-label="Game controls">
        <div
          className="gameboy-dpad"
          role="group"
          aria-label="Directional controls"
        >
          <button
            type="button"
            className="dpad-up"
            aria-label="Rotate clockwise"
            disabled={!stateActive}
            onClick={() => engine.rotate("cw")}
          >
            ▲
          </button>
          <button
            type="button"
            className="dpad-left"
            aria-label="Move left"
            disabled={!stateActive}
            onClick={() => activateDirectionalButton("left")}
          >
            ◀
          </button>
          <span className="dpad-center" aria-hidden="true" />
          <button
            type="button"
            className="dpad-right"
            aria-label="Move right"
            disabled={!stateActive}
            onClick={() => activateDirectionalButton("right")}
          >
            ▶
          </button>
          <button
            type="button"
            className="dpad-down"
            aria-label="Soft drop"
            disabled={!stateActive}
            onClick={() => activateDirectionalButton("down")}
          >
            ▼
          </button>
        </div>
        <div className="gameboy-speaker" aria-hidden="true">
          {Array.from({ length: 24 }, (_, index) => (
            <i key={index} />
          ))}
        </div>
        <div className="gameboy-ab" role="group" aria-label="Action controls">
          <button
            type="button"
            aria-label="Hard drop piece"
            disabled={!stateActive}
            onClick={() => engine.hardDrop()}
          >
            <b>B</b>
          </button>
          <button
            type="button"
            aria-label="Rotate piece"
            disabled={!stateActive}
            onClick={() => engine.rotate("cw")}
          >
            <b>A</b>
          </button>
        </div>
      </div>
      <div className="gameboy-utility">
        <button
          type="button"
          className="gameboy-small-button"
          aria-label="Reset game"
          onClick={() => {
            engine.reset();
            flushEngineInput();
            setAnnouncement("New game started. Use the arrow keys to play.");
          }}
        >
          SELECT
        </button>
        <button
          type="button"
          className="gameboy-small-button"
          aria-label={
            paused
              ? "Resume game"
              : ready || ended
                ? "Start game"
                : countingDown
                  ? "Game starting"
                  : isClearing(game)
                    ? "Finishing line clear"
                    : "Pause game"
          }
          disabled={countingDown || isClearing(game)}
          onClick={togglePause}
        >
          {paused
            ? "RESUME"
            : countingDown
              ? "STARTING…"
              : isClearing(game)
                ? "WAIT"
                : "START / PAUSE"}
        </button>
      </div>
      <p className="gameboy-instructions" id="gameboy-instructions">
        <span>TAB FOCUS · ← / → MOVE · ↓ DROP · ↑ / X TURN</span>
        <span>Z CCW · SPACE DROP · C HOLD · P PAUSE · ENTER</span>
      </p>
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </p>
    </section>
  );
}
