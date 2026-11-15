import { FaAsterisk } from "react-icons/fa6";
import Section from "../portfolio/PortfolioSection";
import { Surface } from "@mdopeace/ui/Surface";
import { Grid, Inline, Stack } from "@mdopeace/ui/Layout";
import { Heading, Text } from "@mdopeace/ui/Typography";
import { Badge } from "@mdopeace/ui/Badge";
import { Link } from "@mdopeace/ui/Link";
export default function Now() {
  return (
    <Section label="What’s cooking" id="now" index="04">
      <Grid columns={{ base: 1, md: 2 }} gap={5}>
        <Surface as="article" tone="subtle" padding={{ base: 6, sm: 8 }} className="workbench-card">
          <Stack gap={4} className="workbench-copy">
            <Badge variant="solid" tone="emphasis" decoration="stamp" className="workbench-stamp">
              In progress
            </Badge>
            <Text variant="eyebrow" tone="muted">
              On the workbench · 01
            </Text>
            <Heading level={3} size="feature">Vidp is still a work in progress.</Heading>
            <Text size="body" tone="muted">
              I use it every day. The features it’s still missing are the ones
              QuickTodo already has. That gap is part of the work—and a reminder
              that building something useful means paying attention after the
              first release.
            </Text>
            <div>
              <Link
                size="sm"
                href="https://github.com/vidplabs/vidp"
                target="_blank"
                externalIndicator
              >
                Follow the build
              </Link>
            </div>
          </Stack>
        </Surface>
        <Surface as="article" padding={{ base: 6, sm: 8 }} className="halftone">
          <Stack gap={6} justify="between" className="full-height">
            <Badge variant="solid" tone="accent">
              More in the works
            </Badge>
            <Text variant="quote">
              The public projects are only part of what I’m working on. Some
              ideas are still taking shape; I’ll share them here when they’re
              ready.
            </Text>
            <Inline gap={2}>
              <Text as="span" variant="eyebrow" tone="muted">
                Stay curious
              </Text>
              <FaAsterisk aria-hidden="true" />
            </Inline>
          </Stack>
        </Surface>
      </Grid>
    </Section>
  );
}
