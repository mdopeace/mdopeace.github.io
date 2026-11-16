import type { ReactNode } from "react";
import { Surface } from "@mdopeace/ui/Surface";
import { Stack } from "@mdopeace/ui/Layout";
import { Badge } from "@mdopeace/ui/Badge";
import type { Tone } from "@mdopeace/ui/tokens";
export function StoryStep({
  title,
  tone = "default",
  children,
}: {
  title: string;
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <Surface as="li" tone={tone} variant="soft" padding={5}>
      <Stack gap={5}>
        <h3>
          <Badge variant="solid" tone="accent">
            {title}
          </Badge>
        </h3>
        {children}
      </Stack>
    </Surface>
  );
}
