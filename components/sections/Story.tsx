import Section from "../portfolio/PortfolioSection";

import { Grid } from "@mdopeace/ui/Layout";
import { Surface } from "@mdopeace/ui/Surface";
import { Text } from "@mdopeace/ui/Typography";
import { StoryStep } from "../portfolio/StoryStep";

export default function Story() {
  return (
    <Section label="How I think" id="story" index="01">
      <Grid as="ol" columns={{ base: 1, md: 3 }} gap={4} className="story-spread">
        <StoryStep title="01 / Notice">
          <Text size="body" tone="muted">
            I’m a cinephile, so it starts with the search for a film worth
            sitting through. Streaming splits across separate subscriptions, and
            whatever is free is buried in ads and buffering — so I download, and
            watch it dark, on a laptop.
          </Text>
        </StoryStep>
        <StoryStep title="02 / Make" tone="info">
          <Text size="body" tone="muted">
            Which made the player the bottleneck. None of them felt like they
            belonged on a Mac.
          </Text>
          <Surface padding={3} elevation="sm">
            <Text size="sm" font="mono" weight="bold">
              So I built one that did. Native, keyboard driven, mine.
            </Text>
          </Surface>
        </StoryStep>
        <StoryStep title="03 / Refine" tone="subtle">
          <Text size="body" tone="muted">
            And then it started over. The first version shipped, and I
            wasn&apos;t satisfied with it. The fixes kept arriving and
            evaporating mid-task — the next idea, gone before I could write it
            down. So I built somewhere to put them.
          </Text>
          <Text size="body" tone="muted">
            With the list finally captured, I can go back and finish what I
            started.
          </Text>
        </StoryStep>
      </Grid>
    </Section>
  );
}
