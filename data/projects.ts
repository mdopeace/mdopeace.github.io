import { withBasePath } from "@/lib/withBasePath";

export type ProjectLink = {
  label: string;
  href: string;
  icon: "github" | "tag" | "chrome" | "firefox";
};

type ProjectStill = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type ProjectPanel = {
  caption: string;
  still?: ProjectStill;
};

export type Project = {
  id: string;
  name: string;
  summary?: string;
  logo?: string;
  pills: string[];
  paragraphs: string[];
  commands: string[];
  tryHref: string;
  links: ProjectLink[];
  strip: { problem: ProjectPanel; idea: ProjectPanel; result: ProjectPanel };
};

export const projects: Project[] = [
  {
    id: "quicktodo",
    name: "QuickTodo",
    summary: "Mac menu bar to-do app built with SwiftUI.",
    logo: "/projects/quicktodo-logo.webp",
    pills: ["macOS 13+", "Intel or Apple Silicon"],
    strip: {
      problem: {
        caption: "Standup hands you five tasks. You dive into one and the other four slip away.",
        still: { src: "/projects/quicktodo-empty.webp", width: 600, height: 362, alt: "An empty task list with an add field at the top." },
      },
      idea: {
        caption: "Put the list in the Mac menu bar. No window to manage, no account, no Electron.",
        still: { src: "/projects/quicktodo-edit.webp", width: 528, height: 600, alt: "A task being renamed directly in the list." },
      },
      result: {
        caption: "See what got done by day. Repeat tasks, rename them in place, or drag to reorder. The app updates itself.",
        still: { src: "/projects/quicktodo-completed.webp", width: 530, height: 600, alt: "Open and completed tasks appear in separate groups." },
      },
    },
    paragraphs: [
      "Native SwiftUI. Add with Return, open with ⌥⇧Space. No window to manage, no account, no Electron.",
      "Standup hands you five things. You go deep on one, and the other four evaporate before you can touch them. So they land here instead — where they can't be lost, which leaves your attention on the work in front of you, and shows you what you actually finished by the end of the day. Day-grouped, repeats daily or weekly, rename in place, drag to reorder.",
      "It also keeps itself current: verifies the download's SHA-256, then replaces the running bundle in place. 65KB of tests, including the installer and the relaunch after it.",
    ],
    commands: ["brew tap mdopeace/quicktodo", "brew install --cask quicktodo"],
    tryHref: "https://mdopeace.github.io/quicktodo/",
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
    logo: "/projects/vidp-logo.webp",
    pills: ["macOS 26+", "Apple Silicon"],
    strip: {
      problem: {
        caption: "You already have the film. Your player looks stuck in 2009 or makes you click through a licence agreement.",
        still: { src: "/projects/vidp-home.webp", width: 600, height: 412, alt: "Vidp waits for a local file on its home screen." },
      },
      idea: {
        caption: "Build with AppKit, mpv, and OpenGL. Drop in a file or open it from Finder.",
        still: { src: "/projects/vidp-overlay.webp", width: 600, height: 377, alt: "Playback controls and the title overlay a lunar scene." },
      },
      result: {
        caption: "A keyboard-driven player I use every day, with macOS Now Playing and automatic updates.",
        still: { src: "/projects/vidp-settings.webp", width: 600, height: 377, alt: "Playback settings open beside a paused film." },
      },
    },
    paragraphs: [
      "You have the file. You double-click it. Then the player you've got either looks like it belongs to 2009, or wants four clicks past a licence agreement before it shows you anything. So: AppKit, mpv, OpenGL. Drag a file in, or hit it from Finder. mp4, m4v, mov, mkv, webm, avi.",
      "It ships its own libmpv and FFmpeg, hands off to the macOS now-playing controls, updates itself from the GitHub API, and uninstalls without leaving anything behind. Releases are arm64, so an Intel machine has to build it from source.",
      "I use it every day. Playback, everyday controls, and deeper customization are already there. Now I'm exploring the extras I want for myself, including ways to give an offline collection the feel of a streaming library.",
    ],
    commands: ["brew tap vidplabs/vidp", "brew install --cask vidp"],
    tryHref: "https://vidplabs.github.io/",
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
    logo: "/projects/cookieater-logo.webp",
    pills: ["Browser Extension", "Manifest V3"],
    strip: {
      problem: {
        caption: "You need a quick way to inspect or edit cookies for the site you’re on.",
        still: { src: "/projects/cookieater-empty-state.webp", width: 600, height: 500, alt: "The cookie list reports that the current site has no cookies." },
      },
      idea: {
        caption: "Open a small Chrome or Firefox extension that works on the current site.",
        still: { src: "/projects/cookieater-edit.webp", width: 566, height: 600, alt: "One cookie row is open for editing while the rest stay in view." },
      },
      result: {
        caption: "Search, edit, add, import, export, or clear cookies. Everything stays in your browser.",
        still: { src: "/projects/cookieater-overview.webp", width: 566, height: 600, alt: "Cookieater lists the names and values of cookies for example.com." },
      },
    },
    paragraphs: [
      "See the active site's cookies at a glance, search names, values, and domains, then edit individual cookie settings or add and remove cookies.",
      "Import cookies from a JSON array, export the current domain's cookies, or clear them all after confirmation.",
      "Cookieater handles cookie data locally in your browser; it doesn't send your data to a Cookieater server.",
    ],
    commands: [],
    tryHref: "https://mdopeace.github.io/cookieater/",
    links: [
      {
        label: "Source",
        icon: "github",
        href: "https://github.com/mdopeace/cookieater",
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
    pills: ["React", "TypeScript", "Component library"],
    strip: {
      problem: { caption: "This portfolio needs components that look and behave consistently from page to page." },
      idea: { caption: "Build a small library with shared tokens, keyboard support, light and dark themes, and reduced motion." },
      result: {
        caption: "Those components power this site. Try their variants in the playground and copy working React examples.",
        still: { src: "/projects/component-library-preview.webp", width: 391, height: 283, alt: "Square badges, a bold heading, and a dotted backdrop demonstrate the shared comic style." },
      },
    },
    paragraphs: [
      "Shared sizing, spacing and depth keep the interface consistent. Keyboard interactions, light and dark themes, and reduced-motion support live in the components, so every page starts with the same foundations.",
    ],
    commands: [],
    tryHref: withBasePath("/playground/"),
    links: [
      { label: "Source", icon: "github", href: "https://github.com/mdopeace/mdopeace.github.io" },
    ],
  },
];
