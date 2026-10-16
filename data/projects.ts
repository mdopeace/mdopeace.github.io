export type Project = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  problem: string;
  image: string | null;
  imageFallback: string | null;
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
      "Day-grouped lists, daily or weekly repeat, inline rename, drag-to-reorder, live search, and a self-updater that verifies the download's SHA-256 and replaces the running bundle in place. 65KB of tests, including ones that exercise the installer and relaunch path.",
    image: "/quicktodo-today.png",
    imageFallback: null,
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
      "Built because there was no Mac player that felt native for watching downloaded video. Ships its own libmpv and FFmpeg, integrates with macOS now-playing, and updates itself from the GitHub API. Still a work in progress — the remaining features are the ones QuickTodo holds.",
    image: null,
    imageFallback: "Screenshot coming — the product page isn't out yet.",
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