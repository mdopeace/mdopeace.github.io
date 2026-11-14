import Section from "../portfolio/PortfolioSection";
import { Surface } from "../ui/Surface";
import { Grid, Stack } from "../ui/Layout";
import { Heading, Text } from "../ui/Typography";
import { Divider } from "../ui/Divider";
export default function DayJob() {
  return (
    <Section label="Experience & toolkit" id="experience" index="03">
      <Grid columns={{ base: 1, md: 2 }} gap={5} className="experience-layout">
        <Surface as="article" padding={{ base: 6, sm: 8 }}>
          <Stack gap={6}>
            <Stack gap={3}>
              <Text variant="eyebrow" tone="emphasis">
                01 · Tracxn
              </Text>
              <Heading level={3}>Software Engineer</Heading>
              <Text variant="eyebrow" tone="muted">
                Bengaluru · Jan 2023 — now
              </Text>
            </Stack>
            <Stack gap={4}>
              <Text size="body" tone="muted">
                Software Engineer at Tracxn, Bengaluru, since January 2023.
                Full-stack web by day — React, Next.js, Astro, Express, MongoDB,
                AWS Lambda, and more.
              </Text>
              <Text size="body" tone="muted">
                Part of the platform team: the app framework and build, logging
                and error tracking, the public and auth pages, the UI
                components. The parts every product ends up needing, and nobody
                demos.
              </Text>
            </Stack>
          </Stack>
        </Surface>
        <Surface as="article" tone="info" padding={{ base: 6, sm: 8 }}>
          <Stack gap={5}>
            <Text variant="eyebrow">
              Things I work with
            </Text>
            <Stack gap={2}>
              <Heading level={3} size="label">Web platform</Heading>
              <Text size="sm">
                React · Next.js · Astro · Express · MongoDB · AWS Lambda · and
                more
              </Text>
            </Stack>
            <Divider />
            <Stack gap={2}>
              <Heading level={3} size="label">Native Mac apps</Heading>
              <Text size="sm">SwiftUI · AppKit · mpv · OpenGL</Text>
            </Stack>
            <Text size="caption" font="mono">
              From shared platform foundations to small tools with a sharp
              purpose.
            </Text>
          </Stack>
        </Surface>
      </Grid>
    </Section>
  );
}
