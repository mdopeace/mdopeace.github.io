import Section from "../portfolio/PortfolioSection";
import { EmailAction } from "../portfolio/EmailAction";
import SupportDialog from "../portfolio/SupportDialog";
import { email, telegramHref } from "../portfolio/contactDetails";
import { Badge } from "@mdopeace/ui/Badge";
import { SpeechBubble } from "@mdopeace/ui/SpeechBubble";
import { Surface } from "@mdopeace/ui/Surface";
import { Heading, Text } from "@mdopeace/ui/Typography";
import { Inline, Stack } from "@mdopeace/ui/Layout";
import { Link } from "@mdopeace/ui/Link";
import { LinkGroup } from "@mdopeace/ui/LinkGroup";
import { Image } from "@mdopeace/ui/Image";
import { FaGithub, FaLinkedinIn, FaTelegram } from "react-icons/fa6";
import { withBasePath } from "@/lib/withBasePath";

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/mdopeace",
    startIcon: <FaGithub />,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mdopeace",
    startIcon: <FaLinkedinIn />,
  },
  {
    label: "Telegram",
    href: telegramHref,
    startIcon: <FaTelegram />,
  },
];
export default function Contact() {
  return (
    <Section label="Get in touch" id="contact" index="05">
      <div className="contact-grid">
        <Stack gap={5}>
          <Badge variant="solid" tone="accent" size="md">
            CH 05 · OPEN CHANNEL
          </Badge>
          <Heading level={3} size="statement">
            Got an idea that won’t leave you alone?
          </Heading>
          <Text tone="muted">
            If you’re building something useful, stuck on a tricky problem, or
            just want to talk about the work, send a signal. I’d love to hear
            what you’re thinking about.
          </Text>
          <Inline gap={3} align="start">
            <Link
              variant="primary"
              size="lg"
              href={`mailto:${email}`}
              externalIndicator
            >
              Start a conversation
            </Link>
            <EmailAction email={email} />
            <SupportDialog />
          </Inline>
          <Stack gap={3}>
            <Inline gap={4}>
              <Text variant="eyebrow">Find me elsewhere</Text>
            </Inline>
            <LinkGroup
              items={socialLinks.map((link) => ({
                ...link,
                target: "_blank",
                externalIndicator: true,
                variant: "secondary",
                size: "sm",
              }))}
            />
          </Stack>
        </Stack>
        <Surface tone="info" texture="paper-soft" padding={0} style={{ padding: "2.8rem 0.5rem 0.6rem" }} className="contact-art">
          <Badge variant="solid" tone="accent" tilt="left" className="contact-stamp">SIGNAL READY</Badge>
          <div className="contact-thought">
            <SpeechBubble variant="thought" size="sm" style={{ inlineSize: "100%" }}>
              <Text size="caption" weight="bold" align="center" leading="tight">
                “What are you
                <br />
                building?”
              </Text>
            </SpeechBubble>
          </div>
          <div
            className="contact-illustration"
            role="img"
            aria-label="A seated maker pauses to think beside a laptop"
          >
            <Image
              className="contact-maker-image"
              src={withBasePath("/contact-maker.webp")}
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 800px) 90vw, 440px"
            />
            <svg
              className="contact-effects"
              viewBox="0 0 440 330"
              aria-hidden="true"
            >
              <g
                className="contact-spark"
                fill="var(--accent-2)"
                stroke="var(--ink)"
                strokeWidth="4"
                strokeLinejoin="round"
              >
                <path
                  transform="translate(-30 0)"
                  d="m89 131 6-15 6 15 15 6-15 6-6 15-6-15-15-6z"
                />
                <path
                  transform="translate(30 0)"
                  d="m380 197 5-12 5 12 12 5-12 5-5 12-5-12-12-5z"
                />
              </g>
            </svg>
          </div>
          <Badge variant="solid" tone="default" className="contact-art-caption">Your turn · send a signal</Badge>
        </Surface>
      </div>
    </Section>
  );
}
