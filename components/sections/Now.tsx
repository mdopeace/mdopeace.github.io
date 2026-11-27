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
      <Grid columns={{ base: 1, md: 2 }} gap={5} className="workbench-layout">
        <Surface as="article" tone="subtle" padding={{ base: 6, sm: 8 }}>
          <Stack gap={4}>
            <Inline gap={3} align="center" justify="between" wrap={false}>
              <Text variant="eyebrow" tone="muted">
                On the workbench · 01
              </Text>
              <Inline wrap={false}>
                <Badge variant="solid" tone="emphasis" decoration="stamp">
                  Evolving
                </Badge>
              </Inline>
            </Inline>
            <Heading level={3} size="feature">Vidp works. My wishlist keeps growing.</Heading>
            <Text size="body" tone="muted">
              I use Vidp every day. Playback, everyday controls, and deeper
              customization are already there. Now I’m exploring the extras I
              want for myself—like connecting a movie database to give an offline
              collection the feel of a streaming library. There’s always
              something else I want to build into it.
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
