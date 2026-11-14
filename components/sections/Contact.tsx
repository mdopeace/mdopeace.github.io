import Section from "../portfolio/PortfolioSection";
import { EmailAction } from "../portfolio/EmailAction";
import SupportDialog from "../portfolio/SupportDialog";
import { Badge } from "../ui/Badge";
import { Surface } from "../ui/Surface";
import { Heading, Text } from "../ui/Typography";
import { Inline, Stack } from "../ui/Layout";
import { Link } from "../ui/Link";
import { LinkGroup } from "../ui/LinkGroup";
import Image from "next/image";
import { FaGithub, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
const email = "md.correo.e@gmail.com";
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
    label: "WhatsApp",
    href: "https://wa.me/mdopeace",
    startIcon: <FaWhatsapp />,
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
            <Text variant="eyebrow">
              Find me elsewhere
            </Text>
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
        <Surface tone="info" padding={0} style={{ padding: "2.8rem 0.5rem 0.6rem" }} className="contact-art">
          <span className="contact-stamp">SIGNAL READY</span>
          <div className="contact-thought">
            <Image
              className="contact-thought-image"
              src="/contact-thought-bubble.png"
              alt=""
              fill
              unoptimized
              sizes="(max-width: 800px) 45vw, 230px"
            />
            <span>
              “What are you
              <br />
              building?”
            </span>
          </div>
          <div
            className="contact-illustration"
            role="img"
            aria-label="A seated maker pauses to think beside a laptop"
          >
            <Image
              className="contact-maker-image"
              src="/contact-maker.png"
              alt=""
              fill
              loading="eager"
              unoptimized
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
          <span className="contact-art-caption">Your turn · send a signal</span>
        </Surface>
      </div>
    </Section>
  );
}
