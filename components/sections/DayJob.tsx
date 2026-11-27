import Section from "../portfolio/PortfolioSection";
import { Surface } from "@mdopeace/ui/Surface";
import { Grid, Inline, Stack } from "@mdopeace/ui/Layout";
import { Heading, Text } from "@mdopeace/ui/Typography";
import { Badge } from "@mdopeace/ui/Badge";

const toolkit = [
  { title: "Web interfaces", label: "01 / Build the interface", tone: "subtle", tools: "JavaScript · TypeScript · React · Next.js · Astro · CSS · SCSS" },
  { title: "Backend & data", label: "02 / Connect the pieces", tone: "info", tools: "Express · MongoDB · AWS Lambda" },
  { title: "Native Mac apps", label: "03 / Make it feel at home", tone: "default", tools: "Swift · SwiftUI · AppKit · mpv · OpenGL" },
  { title: "Developer tooling", label: "04 / Keep it shipping", tone: "subtle", tools: "Build tooling · Release automation · App updates · Browser extensions" },
] as const;

export default function DayJob() {
  return (
    <Section label="Experience & toolkit" id="experience" index="03">
      <Grid gap={6} className="experience-layout">
        <Surface as="article" tone="info" padding={{ base: 6, sm: 8 }}>
          <Stack gap={6}>
            <Inline justify="between" gap={4}>
              <Stack gap={3} align="start">
                <Badge variant="solid" tone="accent">01 · Tracxn</Badge>
                <Heading level={3}>Software Engineer</Heading>
              </Stack>
              <Text variant="eyebrow" tone="muted">
                Bengaluru · Jan 2023 — now
              </Text>
            </Inline>
            <Text size="body" tone="muted" style={{ maxWidth: "72ch" }}>
              At Tracxn, I build shared foundations across the frontend and
              backend: reusable UI components, the app framework, and build
              tooling. My work also spans public-facing and authentication
              pages, logging, and error tracking—the parts every product ends
              up needing, and nobody demos.
            </Text>
          </Stack>
        </Surface>
        <Stack gap={4} className="toolkit-column">
          <Stack gap={4} className="toolkit-tiles">
            <Text variant="eyebrow">Things I work with</Text>
            <Grid columns={{ base: 1, md: 2 }} gap={4}>
              {toolkit.map(({ title, label, tone, tools }) => (
                <Surface key={title} as="article" tone={tone} padding={4}>
                  <Stack gap={3}>
                    <Text variant="eyebrow">{label}</Text>
                    <Heading level={3} size="card">{title}</Heading>
                    <Text size="sm">{tools}</Text>
                  </Stack>
                </Surface>
              ))}
            </Grid>
          </Stack>
          <Text size="caption" font="mono" tone="muted" className="toolkit-caption">
            From shared platform foundations to small tools with a sharp purpose.
          </Text>
        </Stack>
      </Grid>
    </Section>
  );
}
