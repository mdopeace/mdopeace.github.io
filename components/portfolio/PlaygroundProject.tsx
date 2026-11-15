import { FaArrowRightLong, FaGithub } from "react-icons/fa6";
import { Badge } from "../ui/Badge";
import { Stack, Inline } from "../ui/Layout";
import { Link } from "../ui/Link";
import { Surface } from "../ui/Surface";
import { Heading, Text } from "../ui/Typography";
import styles from "./playground-project.module.css";

export default function PlaygroundProject() {
  return (
    <Surface as="article" className="project-layout">
      <Surface tone="subtle" elevation="none" className={styles.preview}>
        <Stack gap={5}>
          <Text font="mono" size="sm">&lt;ComponentLibrary /&gt;</Text>
          <Surface padding={4} elevation="none">
            <Stack gap={3}>
              <Inline gap={2}>
                <Badge variant="solid" tone="emphasis" shape="square">UI</Badge>
                <Badge variant="solid" tone="accent">Made to fit together</Badge>
              </Inline>
              <Text variant="callout">Small parts.<br />A shared language.</Text>
              <Inline gap={2}>
                <Badge>32 / 40 / 48</Badge>
                <Badge>Light + dark</Badge>
              </Inline>
            </Stack>
          </Surface>
          <Text font="mono" size="caption" tone="muted">The same building blocks. This whole site.</Text>
        </Stack>
      </Surface>
      <Stack gap={4} className="project-copy">
        <Inline gap={2}>
          <Badge>React</Badge>
          <Badge>TypeScript</Badge>
          <Badge>Component library</Badge>
        </Inline>
        <Heading level={3} size="card">The building blocks behind this site</Heading>
        <Text variant="callout" tone="muted">
          A small component library that powers this portfolio. Explore the
          variants, change the properties, and copy working React examples.
        </Text>
        <Text tone="muted">
          Shared sizing, spacing and depth keep the interface consistent. Keyboard
          interactions, light and dark themes, and reduced-motion support live in
          the components, so every page starts with the same foundations.
        </Text>
        <Inline gap={3}>
          <Link href="/playground/" variant="primary" size="sm" endIcon={<FaArrowRightLong />}>
            Explore playground
          </Link>
          <Link href="https://github.com/mdopeace/mdopeace.github.io"
            variant="secondary" size="sm" startIcon={<FaGithub />} externalIndicator>
            View source
          </Link>
        </Inline>
      </Stack>
    </Surface>
  );
}
