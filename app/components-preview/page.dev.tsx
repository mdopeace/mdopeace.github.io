"use client";
import { useState } from "react";
import { FaHeart, FaMoon, FaSun } from "react-icons/fa6";
import { Container, Grid, Inline, Stack } from "@/components/ui/Layout";
import { Surface } from "@/components/ui/Surface";
import { Heading, Text } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { Dialog } from "@/components/ui/Dialog";
import { Divider } from "@/components/ui/Divider";
import { Switch } from "@/components/ui/Switch";
import { Section } from "@/components/ui/Section";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { LinkGroup } from "@/components/ui/LinkGroup";
import ThemeToggle from "@/components/ThemeToggle";
export default function ComponentPreview() {
  const [open, setOpen] = useState(false);
  return (
    <Container>
      <main>
        <Section
          title="Component library"
          heading={
            <Heading level={1} size="section">
              Component library
            </Heading>
          }
        >
          <Stack gap={8}>
            <Inline justify="between">
              <Text>Local component showcase — compare both themes.</Text>
              <ThemeToggle />
            </Inline>
            <Grid columns={{ base: 1, md: 3 }} gap={6}>
              {(
                ["default", "subtle", "accent", "info", "emphasis"] as const
              ).map((tone) => (
                <Surface tone={tone} key={tone}>
                  <Stack gap={4}>
                    <Heading level={3}>{tone} surface</Heading>
                    <Text>Body text stays readable on this background.</Text>
                    <Text tone="muted" size="sm">
                      Supporting text uses a paired foreground.
                    </Text>
                    <Link href="#controls">A link on this surface</Link>
                    <Badge>Metadata</Badge>
                  </Stack>
                </Surface>
              ))}
            </Grid>
            <Heading level={2} id="controls">
              Controls
            </Heading>
            {(["primary", "secondary", "ghost"] as const).map((variant) => (
              <Inline key={variant}>
                {(["sm", "md", "lg"] as const).map((size) => (
                  <Button
                    key={size}
                    variant={variant}
                    size={size}
                    startIcon={<FaHeart />}
                  >
                    {variant} {size}
                  </Button>
                ))}
                <Button variant={variant} disabled>
                  Disabled
                </Button>
                <Button variant={variant} loading>
                  Loading
                </Button>
              </Inline>
            ))}
            <Inline>
              <Button iconOnly aria-label="Favorite" startIcon={<FaHeart />} />
              <Switch
                aria-label="Example setting"
                checkedIcon={<FaMoon />}
                uncheckedIcon={<FaSun />}
              />
              <Switch aria-label="Disabled setting" disabled />
              <Link href="/">Back to app</Link>
            </Inline>
            <Inline>
              {(["none", "sm", "md", "lg", "xl"] as const).map((elevation) => (
                <Surface key={elevation} elevation={elevation} padding={4}>
                  <Text>{elevation} box shadow</Text>
                </Surface>
              ))}
            </Inline>
            <Heading level={2}>Typography and badges</Heading>
            <Stack gap={3}>
              {(["caption", "sm", "md", "lg"] as const).map((size) => (
                <Text key={size} size={size}>
                  Readable {size} text at its shared token size.
                </Text>
              ))}
            </Stack>
            <Inline>
              {(
                ["default", "accent", "info", "emphasis", "success"] as const
              ).map((tone) => (
                <Inline key={tone} gap={2}>
                  <Badge tone={tone}>{tone}</Badge>
                  <Badge variant="solid" tone={tone}>
                    {tone}
                  </Badge>
                </Inline>
              ))}
            </Inline>
            <Inline>
              {(["sm", "md", "lg"] as const).map((size) => (
                <Switch
                  key={size}
                  size={size}
                  aria-label={`${size} example switch`}
                />
              ))}
            </Inline>
            <Divider />
            <CodeBlock code={"npm install\nnpm run dev"} />
            <ExpandableText expandLabel="Read more" collapseLabel="Read less">
              {"Expandable content. ".repeat(100)}
            </ExpandableText>
            <LinkGroup
              items={[
                {
                  label: "Repository",
                  href: "https://github.com/mdopeace/mdopeace.github.io",
                  externalIndicator: true,
                },
              ]}
            />
            <div>
              <Button onClick={() => setOpen(true)}>Open dialog</Button>
            </div>
            <Dialog
              open={open}
              onOpenChange={setOpen}
              title="Example dialog"
              description="Test Escape, backdrop dismissal, focus restoration and reduced motion."
              closeLabel="Close example"
            >
              <Text>
                Dialog content remains in the tab order only while the dialog is
                open.
              </Text>
            </Dialog>
          </Stack>
        </Section>
      </main>
    </Container>
  );
}
