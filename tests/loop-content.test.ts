import { test } from "node:test";
import assert from "node:assert/strict";
import { loopSteps } from "../data/site";

// The hero opens with "no Mac player felt right", so the loop must start
// further back — at the reason a player was wanted at all — or it adds
// nothing a reader has not already read.
test("the loop explains what the hero does not", () => {
  const [first] = loopSteps;
  assert.match(
    first,
    /stream|subscription|movies|series|anime|watch/i,
    `step 1 repeats the hero instead of starting the chain: "${first}"`,
  );
  assert.match(loopSteps[1], /player/i, "step 2 should name the player built");
  assert.match(
    loopSteps[2],
    /QuickTodo/i,
    "step 3 should name QuickTodo, the thing built to hold the ideas",
  );
});

test("the loop names both apps by name", () => {
  const all = loopSteps.join(" ");
  assert.match(all, /[Vv]idp|player/);
  assert.match(all, /QuickTodo/);
});

test("every loop step carries information, and none is a title", () => {
  for (const step of loopSteps) {
    assert.ok(step.length > 60, `step reads as a heading, not an explanation: "${step}"`);
  }
});