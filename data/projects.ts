export type ProjectLink = { label: string; href: string };

export type Project = {
  name: string;
  logo: string;
  shot: string;
  shotAlt: string;
  pills: string[];
  tagline: string;
  paragraphs: string[];
  commands: string[];
  links: ProjectLink[];
};

export const projects: Project[] = [
  {
    name: "QuickTodo",
    logo: "https://raw.githubusercontent.com/mdopeace/quicktodo/main/docs/icon.png",
    shot: "https://raw.githubusercontent.com/mdopeace/quicktodo/main/docs/screenshots/completed.png",
    shotAlt: "QuickTodo — a todo app that lives in your Mac menu bar.",
    pills: ["macOS 13+", "Intel or Apple Silicon"],
    tagline:
      "A todo app that lives in your Mac menu bar — for the things that don't survive the meeting.",
    paragraphs: [
      "Native SwiftUI. Add with Return, open with ⌘⌥T. No window to manage, no account, no Electron.",
      "Standup hands you five things. You go deep on one, and the other four evaporate before you can touch them. So they land here instead — where they can't be lost, which leaves your attention on the work in front of you, and shows you what you actually finished by the end of the day. Day-grouped, repeats daily or weekly, rename in place, drag to reorder.",
      "It also keeps itself current: verifies the download's SHA-256, then replaces the running bundle in place. 65KB of tests, including the installer and the relaunch after it.",
    ],
    commands: [
      "brew tap mdopeace/quicktodo",
      "brew install --cask quicktodo",
    ],
    links: [
      { label: "Source", href: "https://github.com/mdopeace/quicktodo" },
      {
        label: "Releases",
        href: "https://github.com/mdopeace/quicktodo/releases",
      },
      { label: "Live page", href: "https://mdopeace.github.io/quicktodo/" },
      {
        label: "Homebrew tap",
        href: "https://github.com/mdopeace/homebrew-quicktodo",
      },
    ],
  },
  {
    name: "Vidp",
    logo: "https://raw.githubusercontent.com/mdopeace/vidp/main/docs/icon.png",
    shot: "https://raw.githubusercontent.com/mdopeace/vidp/main/docs/screenshots/paused.png",
    shotAlt:
      "Vidp — a keyboard-driven video player for the film you already downloaded.",
    pills: ["macOS 13+", "Apple Silicon"],
    tagline:
      "A keyboard-driven video player built on libmpv — for the film you already downloaded.",
    paragraphs: [
      "You have the file. You double-click it. Then the player you've got either looks like it belongs to 2009, or wants four clicks past a licence agreement before it shows you anything. So: AppKit, mpv, OpenGL. Drag a file in, or hit it from Finder. mp4, m4v, mov, mkv, webm, avi.",
      "It ships its own libmpv and FFmpeg, hands off to the macOS now-playing controls, updates itself from the GitHub API, and uninstalls without leaving anything behind. Releases are arm64, so an Intel machine has to build it from source.",
      "I use it every day. It isn't finished — and the features it's still missing are the ones QuickTodo already has.",
    ],
    commands: ["brew tap mdopeace/vidp", "brew install --cask vidp"],
    links: [
      { label: "Source", href: "https://github.com/mdopeace/vidp" },
      { label: "Releases", href: "https://github.com/mdopeace/vidp/releases" },
      { label: "Live page", href: "https://mdopeace.github.io/vidp/" },
      { label: "Homebrew tap", href: "https://github.com/mdopeace/homebrew-vidp" },
    ],
  },
];
