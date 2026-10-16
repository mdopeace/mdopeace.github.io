export type Project = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  problem: string;
  image: string | null;
  imageFallback: string | null;
  requires: string[];
  brew: { tap: string; install: string } | null;
  links: { label: string; href: string }[];
  featured: boolean;
};

export const projects: Project[] = [
  {
    slug: "quicktodo",
    name: "QuickTodo",
    tagline: "A todo app that lives in your Mac menu bar.",
    summary:
      "Native SwiftUI menu-bar app. Add with Return, open with ⌘⌥T. No window to manage, no account, no Electron.",
    problem:
      "Standup hands me five things, I spend the day deep in one, and the other four evaporate. This is where the list goes so it stops living in my head — which leaves my attention on the actual work, and shows what I finished by the end of it. Day-grouped lists, daily or weekly repeat, inline rename, drag-to-reorder, and a self-updater that verifies the download's SHA-256 and replaces the running bundle in place. 65KB of tests, including ones that exercise the installer and relaunch path.",
    image: "/quicktodo-hero.png",
    imageFallback: null,
    requires: ["macOS 13 or newer", "Apple Silicon or Intel"],
    brew: {
      tap: "brew tap mdopeace/quicktodo",
      install: "brew install --cask quicktodo",
    },
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
    featured: true,
  },
  {
    slug: "vidp",
    name: "Vidp",
    tagline: "A keyboard-driven video player built on libmpv.",
    summary:
      "Native AppKit player rendering through mpv/OpenGL. Plays mp4, m4v, mov, mkv, webm and avi, from a file or straight from Finder.",
    problem:
      "There was no Mac player that felt native for watching downloaded video, so I built one — shipping its own libmpv and FFmpeg, integrating with macOS now-playing, updating itself from the GitHub API, and uninstalling with full cleanup. It works and I use it daily. It is not finished: the remaining features are the ones QuickTodo holds.",
    image: null,
    imageFallback: "Screenshot coming — the product page isn't out yet.",
    requires: [
      "macOS 13 or newer",
      "Apple Silicon only — releases are arm64, so build from source on Intel",
    ],
    brew: { tap: "brew tap mdopeace/vidp", install: "brew install --cask vidp" },
    links: [
      { label: "Source", href: "https://github.com/mdopeace/vidp" },
      { label: "Releases", href: "https://github.com/mdopeace/vidp/releases" },
      {
        label: "Homebrew tap",
        href: "https://github.com/mdopeace/homebrew-vidp",
      },
    ],
    featured: true,
  },
];