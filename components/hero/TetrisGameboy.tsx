"use client";

import { Tile } from "@mdopeace/ui/Tile";
import { Button } from "@mdopeace/ui/Button";
import { Text } from "@mdopeace/ui/Typography";
import styles from "./gameboy.module.css";

import { FaCaretUp, FaCaretLeft, FaCaretRight, FaCaretDown } from "react-icons/fa6";

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
          `${clear.lines} line${clear.lines === 1 ? "" : "s"} cleared. ${clear.points} points earned. Score ${engine.getSnapshot().score}, ${engine.getSnapshot().lines} lines, level ${engine.getSnapshot().level}.`,
        ),
      ),
      engine.on("pieceLock", () => {
        const state = engine.getSnapshot();
        setAnnouncement(
          `Piece placed. Score ${state.score}, ${state.lines} lines, level ${state.level}.`,
        );
      }),
      engine.on("levelUp", ({ level }) =>
        setAnnouncement(`Level ${level}. Score ${engine.getSnapshot().score}.`),
      ),
      engine.on("hold", ({ current }) =>
        setAnnouncement(`Piece held. ${current} piece is in the hold slot.`),
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
        <Tile faceColor="var(--accent-2)" textColor="var(--ink-on-accent-2)" frameColor="var(--ink)" aria-hidden="true">GB</Tile>
        <Text as="span" size="caption" font="mono" weight="black">
          POCKET <i>COLOR</i>
        </Text>
        <Tile
          size="sm"
          className={styles.indicator}
          faceColor="var(--indicator-light)"
          frameColor="var(--indicator-frame)"
          data-state={ledState}
          aria-hidden="true"
        />
      </div>
      <div className="gameboy-bezel">
        <div className="gameboy-screen">
          <div className="gameboy-screen-heading">
            <Text as="span" size="caption" font="mono" weight="black">POCKET TETRIS</Text>
            <Text as="span" size="caption" font="mono" weight="black">MARATHON</Text>
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
                <Text as="span" size="xs" font="mono" weight="black">SCORE</Text>
                <Text as="strong" size="sm" font="mono" weight="black" leading="tight">{game.score.toString().padStart(5, "0")}</Text>
              </div>
              <div>
                <Text as="span" size="xs" font="mono" weight="black">LINES</Text>
                <Text as="strong" size="sm" font="mono" weight="black" leading="tight">{game.lines.toString().padStart(2, "0")}</Text>
              </div>
              <div>
                <Text as="span" size="xs" font="mono" weight="black">LEVEL</Text>
                <Text as="strong" size="sm" font="mono" weight="black" leading="tight">{game.level.toString().padStart(2, "0")}</Text>
              </div>
              <div>
                <Text as="span" size="xs" font="mono" weight="black">NEXT</Text>
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
            <div className="tetris-overlay" hidden={!overlayTitle} inert={!overlayTitle}>
              <Text key={overlayTitle} as="strong" size="sm" font="mono" weight="black" leading="tight" className="tetris-overlay-title">{overlayTitle}</Text>
              {overlayButton ? (
                <Button size="sm" variant="secondary"
                  type="button"
                  className={`${styles.deviceButton} ${styles.screen} tetris-screen-button${ready ? " tetris-screen-button--start" : ""}`}
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
                </Button>
              ) : overlayTitle ? (
                <Text as="span" size="caption" font="mono" align="center">
                  Controls unlock in a moment
                </Text>
              ) : null}
            </div>
        </div>
      </div>
      <div className="gameboy-hinge">
        <Text as="span" size="xs" font="mono" weight="black">PIXEL POWER · 8-BIT DAYDREAM</Text>
      </div>
      <div className="gameboy-controls" role="group" aria-label="Game controls">
        <div
          className="gameboy-dpad"
          role="group"
          aria-label="Directional controls"
        >
          <Button size="sm" variant="secondary"
            type="button"
            iconOnly
            startIcon={<FaCaretUp focusable="false" />}
            className={`${styles.deviceButton} ${styles.direction} dpad-up`}
            aria-label="Rotate clockwise"
            disabled={!stateActive}
            onClick={() => engine.rotate("cw")}
          />
          <Button size="sm" variant="secondary"
            type="button"
            iconOnly
            startIcon={<FaCaretLeft focusable="false" />}
            className={`${styles.deviceButton} ${styles.direction} dpad-left`}
            aria-label="Move left"
            disabled={!stateActive}
            onClick={() => activateDirectionalButton("left")}
          />
          <span className="dpad-center" aria-hidden="true" />
          <Button size="sm" variant="secondary"
            type="button"
            iconOnly
            startIcon={<FaCaretRight focusable="false" />}
            className={`${styles.deviceButton} ${styles.direction} dpad-right`}
            aria-label="Move right"
            disabled={!stateActive}
            onClick={() => activateDirectionalButton("right")}
          />
          <Button size="sm" variant="secondary"
            type="button"
            iconOnly
            startIcon={<FaCaretDown focusable="false" />}
            className={`${styles.deviceButton} ${styles.direction} dpad-down`}
            aria-label="Soft drop"
            disabled={!stateActive}
            onClick={() => activateDirectionalButton("down")}
          />
        </div>
        <div className="gameboy-speaker" aria-hidden="true">
          {Array.from({ length: 24 }, (_, index) => (
            <i key={index} />
          ))}
        </div>
        <div className="gameboy-ab" role="group" aria-label="Action controls">
          <Button size="sm" variant="secondary"
            type="button"
            className={`${styles.deviceButton} ${styles.action}`}
            aria-label="B, hard drop piece"
            disabled={!stateActive}
            onClick={() => engine.hardDrop()}
          >
            B
          </Button>
          <Button size="sm" variant="secondary"
            type="button"
            className={`${styles.deviceButton} ${styles.action}`}
            aria-label="A, rotate piece"
            disabled={!stateActive}
            onClick={() => engine.rotate("cw")}
          >
            A
          </Button>
          <Button size="sm" variant="secondary"
            type="button"
            className={`${styles.deviceButton} ${styles.action} ${styles.hold} gameboy-hold-button`}
            aria-label="Hold piece"
            disabled={!stateActive}
            onClick={() => engine.hold()}
          >
            HOLD
          </Button>
        </div>
      </div>
      <div className="gameboy-utility">
        <Button size="sm" variant="secondary"
          type="button"
          className={`${styles.deviceButton} ${styles.utility} gameboy-small-button`}
          aria-label="Select, reset game"
          onClick={() => {
            engine.reset();
            flushEngineInput();
            setAnnouncement("New game started. Use the arrow keys to play.");
          }}
        >
          SELECT
        </Button>
        <Button size="sm" variant="secondary"
          type="button"
          className={`${styles.deviceButton} ${styles.utility} gameboy-small-button`}
          aria-label={
            paused
              ? "Resume game"
              : ready || ended
                ? "Start / Pause, start game"
                : countingDown
                  ? "Starting…"
                  : isClearing(game)
                    ? "Wait, finishing line clear"
                    : "Start / Pause, pause game"
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
        </Button>
      </div>
      <Text size="xs" font="mono" weight="black" align="center" className={`${styles.instructions} gameboy-instructions`} id="gameboy-instructions">
        <Text as="span" size="xs" font="mono" weight="black" align="center">TAB FOCUS · ← / → MOVE · ↓ DROP · ↑ / X TURN</Text>
        <Text as="span" size="xs" font="mono" weight="black" align="center">Z CCW · SPACE DROP · C HOLD · P PAUSE · ENTER</Text>
      </Text>
      <Text
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </Text>
    </section>
  );
}
