export type ProjectLink = {
  label: string;
  href: string;
  icon: "github" | "tag" | "globe" | "chrome" | "firefox";
};

export type Project = {
  id: string;
  name: string;
  summary?: string;
  logo?: string;
  pills: string[];
  tagline: string;
  paragraphs: string[];
  commands: string[];
  links: ProjectLink[];
} & (
  | { shot: string; shotAlt: string; shotWidth: number; shotHeight: number; preview?: never }
  | { preview: "component-library"; shot?: never; shotAlt?: never }
);

export const projects: Project[] = [
  {
    id: "quicktodo",
    name: "QuickTodo",
    summary: "Mac menu bar to-do app built with SwiftUI.",
    logo: "https://raw.githubusercontent.com/mdopeace/quicktodo/main/docs/icon.png",
    shot: "https://raw.githubusercontent.com/mdopeace/quicktodo/main/docs/screenshots/completed.png",
    shotWidth: 692,
    shotHeight: 784,
    shotAlt: "QuickTodo — a todo app that lives in your Mac menu bar.",
    pills: ["macOS 13+", "Intel or Apple Silicon"],
    tagline:
      "A todo app that lives in your Mac menu bar — for the things that don't survive the meeting.",
    paragraphs: [
      "Native SwiftUI. Add with Return, open with ⌥⇧Space. No window to manage, no account, no Electron.",
      "Standup hands you five things. You go deep on one, and the other four evaporate before you can touch them. So they land here instead — where they can't be lost, which leaves your attention on the work in front of you, and shows you what you actually finished by the end of the day. Day-grouped, repeats daily or weekly, rename in place, drag to reorder.",
      "It also keeps itself current: verifies the download's SHA-256, then replaces the running bundle in place. 65KB of tests, including the installer and the relaunch after it.",
    ],
    commands: ["brew tap mdopeace/quicktodo", "brew install --cask quicktodo"],
    links: [
      {
        label: "Source",
        icon: "github",
        href: "https://github.com/mdopeace/quicktodo",
      },
      {
        label: "Releases",
        icon: "tag",
        href: "https://github.com/mdopeace/quicktodo/releases",
      },
      {
        label: "Live page",
        icon: "globe",
        href: "https://mdopeace.github.io/quicktodo/",
      },
      {
        label: "Homebrew tap",
        icon: "github",
        href: "https://github.com/mdopeace/homebrew-quicktodo",
      },
    ],
  },
  {
    id: "vidp",
    name: "Vidp",
    summary: "Keyboard-driven macOS video player built on libmpv.",
    logo: "https://vidplabs.github.io/icon.png",
    shot: "https://vidplabs.github.io/screenshots/paused.png",
    shotWidth: 640,
    shotHeight: 402,
    shotAlt:
      "Vidp paused on a lunar scene, with playback controls, the video title, and timeline visible.",
    pills: ["macOS 26+", "Apple Silicon"],
    tagline:
      "A keyboard-driven video player built on libmpv — for the film you already downloaded.",
    paragraphs: [
      "You have the file. You double-click it. Then the player you've got either looks like it belongs to 2009, or wants four clicks past a licence agreement before it shows you anything. So: AppKit, mpv, OpenGL. Drag a file in, or hit it from Finder. mp4, m4v, mov, mkv, webm, avi.",
      "It ships its own libmpv and FFmpeg, hands off to the macOS now-playing controls, updates itself from the GitHub API, and uninstalls without leaving anything behind. Releases are arm64, so an Intel machine has to build it from source.",
      "I use it every day. Playback, everyday controls, and deeper customization are already there. Now I'm exploring the extras I want for myself, including ways to give an offline collection the feel of a streaming library.",
    ],
    commands: ["brew tap vidplabs/vidp", "brew install --cask vidp"],
    links: [
      {
        label: "Source",
        icon: "github",
        href: "https://github.com/vidplabs/vidp",
      },
      {
        label: "Releases",
        icon: "tag",
        href: "https://github.com/vidplabs/vidp/releases",
      },
      {
        label: "Live page",
        icon: "globe",
        href: "https://vidplabs.github.io/",
      },
      {
        label: "Homebrew tap",
        icon: "github",
        href: "https://github.com/vidplabs/homebrew-vidp",
      },
    ],
  },
  {
    id: "cookieater",
    name: "Cookieater",
    summary: "Chrome and Firefox extension for editing cookies.",
    logo: "https://raw.githubusercontent.com/mdopeace/cookieater/main/docs/icon.png",
    shot: "https://raw.githubusercontent.com/mdopeace/cookieater/main/docs/screenshots/overview.png",
    shotWidth: 960,
    shotHeight: 1018,
    shotAlt:
      "Cookieater showing example.com cookies and the search, add, import, export, and clear actions.",
    pills: ["Browser Extension", "Manifest V3"],
    tagline:
      "A friendly Chrome and Firefox extension for viewing, searching, and editing cookies on the current site.",
    paragraphs: [
      "See the active site's cookies at a glance, search names, values, and domains, then edit individual cookie settings or add and remove cookies.",
      "Import cookies from a JSON array, export the current domain's cookies, or clear them all after confirmation.",
      "Cookieater handles cookie data locally in your browser; it doesn't send your data to a Cookieater server.",
    ],
    commands: [],
    links: [
      {
        label: "Source",
        icon: "github",
        href: "https://github.com/mdopeace/cookieater",
      },
      {
        label: "Live page",
        icon: "globe",
        href: "https://mdopeace.github.io/cookieater/",
      },
      {
        label: "Chrome Web Store",
        icon: "chrome",
        href: "https://chromewebstore.google.com/detail/cookieater/eokikmfhgicnmkhldphchbligfgjbkbi",
      },
      {
        label: "Firefox Add-ons",
        icon: "firefox",
        href: "https://addons.mozilla.org/en-US/firefox/addon/cookieater-cookie-manager/",
      },
    ],
  },
  {
    id: "component-library",
    name: "Component Library",
    preview: "component-library",
    pills: ["React", "TypeScript", "Component library"],
    tagline:
      "A small component library that powers this portfolio. Explore the variants, change the properties, and copy working React examples.",
    paragraphs: [
      "Shared sizing, spacing and depth keep the interface consistent. Keyboard interactions, light and dark themes, and reduced-motion support live in the components, so every page starts with the same foundations.",
    ],
    commands: [],
    links: [
      { label: "Source", icon: "github", href: "https://github.com/mdopeace/mdopeace.github.io" },
      { label: "Explore playground", icon: "globe", href: "/playground/" },
    ],
  },
];
