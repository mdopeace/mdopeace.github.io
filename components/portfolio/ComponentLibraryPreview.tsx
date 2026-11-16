import { Badge } from "@mdopeace/ui/Badge";
import { Stack, Inline } from "@mdopeace/ui/Layout";
import { Surface } from "@mdopeace/ui/Surface";
import { Text } from "@mdopeace/ui/Typography";
import styles from "./playground-project.module.css";

export default function ComponentLibraryPreview() {
  return (
    <Stack gap={5} className={styles.preview}>
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
  );
}
