// GA4 events: stay_time (visible seconds), scroll_depth (percent milestones),
// sticker_found (first collection), and tetris_play (new game).
type EventName = "stay_time" | "scroll_depth" | "sticker_found" | "tetris_play";
type SendEvent = (name: EventName, values?: Record<string, number>) => void;

let sendEvent: SendEvent | undefined;

export function setAnalyticsSender(sender?: SendEvent) {
  sendEvent = sender;
}

export function trackAnalytics(name: EventName, values?: Record<string, number>) {
  sendEvent?.(name, values);
}
