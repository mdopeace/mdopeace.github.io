import { Inline, Stack } from "@mdopeace/ui/Layout";
import { Link } from "@mdopeace/ui/Link";
import { SpeechBubble } from "@mdopeace/ui/SpeechBubble";
import { Heading, Text } from "@mdopeace/ui/Typography";
import { email, telegramHref } from "./contactDetails";

// WAITING ON MD: replace with the real CV URL or file path when provided.
// The CV link stays hidden while this is empty.
const CV_HREF = "";

export function PortfolioSummary() {
  return (
    <SpeechBubble role="region" aria-labelledby="portfolio-summary" tail="top-start">
      <Stack gap={3}>
        <Heading level={2} size="card" id="portfolio-summary">
          60-second TL;DR
        </Heading>
        <Text>
          I’m Md Mostafijur Rahman, a software engineer in Bengaluru. At
          Tracxn, I work across the web platform. Outside work, I turn things I
          wish existed into small, useful tools.
        </Text>
        <Text>
          <Link href="#work">Projects</Link> include QuickTodo (Mac to-do app),
          Vidp (keyboard-driven video player), Cookieater (browser cookie
          editor), and the Component Library that powers this site.
        </Text>
        <Inline>
          <Link href={`mailto:${email}`}>{email}</Link>
          <Link href={telegramHref}>Telegram</Link>
          <Link href="#contact">Contact</Link>
          {CV_HREF && <Link href={CV_HREF} variant="primary">View CV</Link>}
        </Inline>
      </Stack>
    </SpeechBubble>
  );
}
