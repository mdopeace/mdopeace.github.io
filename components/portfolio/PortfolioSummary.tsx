"use client";

import { useId, useRef, useState, type MouseEvent } from "react";
import { Badge } from "@mdopeace/ui/Badge";
import { Button, ControlIcon } from "@mdopeace/ui/Button";
import { Dialog } from "@mdopeace/ui/Dialog";
import { Divider } from "@mdopeace/ui/Divider";
import { Grid, Inline, Stack } from "@mdopeace/ui/Layout";
import { Link } from "@mdopeace/ui/Link";
import { Surface, type SurfaceProps } from "@mdopeace/ui/Surface";
import { Heading, Text } from "@mdopeace/ui/Typography";
import { FaArrowDown, FaBolt, FaBriefcase, FaEnvelope, FaLocationDot, FaTelegram, FaWandMagicSparkles } from "react-icons/fa6";
import { projects } from "@/data/projects";
import { email, telegramHref } from "./contactDetails";
import { getSectionLinkTarget, navigateToSection } from "./SectionNavigation";
import styles from "./portfolio-summary.module.css";

// WAITING ON MD: replace with the real CV URL or file path when provided.
// The CV link stays hidden while this is empty.
const CV_HREF = "";

const powers = [
  "JavaScript", "TypeScript", "React", "Next.js", "Express", "MongoDB", "AWS Lambda", "Swift", "SwiftUI",
];

const featuredProjects = projects.filter((project) => project.summary);
const projectTones: Record<string, SurfaceProps["tone"]> = {
  quicktodo: "accent",
  cookieater: "emphasis",
};

export function PortfolioSummary() {
  const [open, setOpen] = useState(false);
  const id = useId();
  const destination = useRef<HTMLElement | null>(null);

  function closeForNavigation(event: MouseEvent<HTMLAnchorElement>) {
    const target = getSectionLinkTarget(event.nativeEvent);
    if (!target) return;
    event.preventDefault();
    destination.current = target;
    setOpen(false);
  }

  return (
    <>
      <Button
        variant="secondary"
        aria-haspopup="dialog"
        aria-controls={id}
        onClick={() => setOpen(true)}
      >
        See my character card
      </Button>
      <Dialog
        id={id}
        open={open}
        onOpenChange={setOpen}
        onClose={() => {
          const target = destination.current;
          destination.current = null;
          if (target) navigateToSection(target);
        }}
        title="Character Card"
        titleSize="feature"
        closeLabel="Close character card"
        size="md"
        className={styles.dialog}
      >
        <Stack gap={{ base: 3, sm: 6 }}>
          <Surface padding={0} elevation="md">
            <dl className={styles.stats}>
              <div className={styles.identity}>
                <dt>
                  <Text as="span" variant="eyebrow">Class</Text>
                  <span className={styles.classIcon} aria-hidden="true">
                    <ControlIcon size="lg"><FaBriefcase focusable="false" /></ControlIcon>
                  </span>
                </dt>
                <dd className={styles.classValue}>Software Engineer</dd>
              </div>
              <div className={styles.base}>
                <dt className={styles.label}>
                  <ControlIcon size="sm"><FaLocationDot focusable="false" /></ControlIcon>
                  <Text as="span" variant="eyebrow">Guild / Base</Text>
                </dt>
                <dd><Text as="span" size="sm" weight="bold">Tracxn since 2023 · Bengaluru</Text></dd>
              </div>
              <div className={styles.powers}>
                <dt id={`${id}-powers`} className={styles.label}>
                  <ControlIcon size="sm"><FaBolt focusable="false" /></ControlIcon>
                  <Text as="span" variant="eyebrow">Powers</Text>
                </dt>
                <dd>
                  <Inline as="ul" aria-labelledby={`${id}-powers`} role="list" gap={2}>
                    {powers.map(power => (
                      <li key={power}>
                        <Badge variant="solid" size="md" className={styles.power}>{power}</Badge>
                      </li>
                    ))}
                    <li>
                      <Badge variant="solid" tone="emphasis" size="md" className={`${styles.power} ${styles.specialPower}`}>
                        <FaWandMagicSparkles aria-hidden="true" focusable="false" />
                        <span>+ Learns new powers with AI</span>
                      </Badge>
                    </li>
                  </Inline>
                </dd>
              </div>
            </dl>
          </Surface>
          <Stack gap={3}>
            <Heading id={`${id}-projects`} level={3} size="label">Selected projects</Heading>
            <Grid as="ul" columns={{ base: 1, sm: 3 }} gap={{ base: 3, sm: 4 }} className={styles.projects} aria-labelledby={`${id}-projects`} role="list">
              {featuredProjects.map(({ id: projectId, name, summary }) => (
                <Surface
                  as="li"
                  key={projectId}
                  data-project={projectId}
                  tone={projectTones[projectId]}
                  elevation="md"
                  padding={{ base: 2, sm: 3 }}
                  className={styles.project}
                >
                  <Link
                    href={`#${projectId}`}
                    onClick={closeForNavigation}
                    aria-describedby={`${id}-${projectId}-summary`}
                    className={styles.projectLink}
                  >
                    <span>{name}</span>
                    <ControlIcon size="sm"><FaArrowDown focusable="false" /></ControlIcon>
                  </Link>
                  <Text size="sm" className={styles.projectSummary} id={`${id}-${projectId}-summary`}>{summary}</Text>
                </Surface>
              ))}
            </Grid>
          </Stack>
          <Divider variant="dashed" tone="muted" />
          <Inline gap={3}>
            <Link href={`mailto:${email}`} variant="primary" startIcon={<FaEnvelope focusable="false" />} startIconSize="sm">Email</Link>
            <Link href={telegramHref} variant="secondary" startIcon={<FaTelegram focusable="false" />} startIconSize="sm">Telegram</Link>
            {CV_HREF && <Link href={CV_HREF} variant="primary">View CV</Link>}
          </Inline>
        </Stack>
      </Dialog>
    </>
  );
}
