"use client";
import { useId, useState } from "react";
import { FaGithub, FaHeart, FaMugHot } from "react-icons/fa6";
import { Dialog } from "@mdopeace/ui/Dialog";
import { Badge } from "@mdopeace/ui/Badge";
import { Button } from "@mdopeace/ui/Button";
import { Link } from "@mdopeace/ui/Link";
import { Grid, Inline, Stack } from "@mdopeace/ui/Layout";
import { Surface } from "@mdopeace/ui/Surface";
import { Text } from "@mdopeace/ui/Typography";
export default function SupportDialog() {
  const [open, setOpen] = useState(false);
  const id = useId();
  const descriptionId = `${id}-description`;
  return (
    <>
      <Button
        size="lg"
        aria-haspopup="dialog"
        aria-controls={id}
        onClick={() => setOpen(true)}
        endIcon={<FaHeart />}
        iconTone="emphasis"
      >
        Support my work
      </Button>
      <Dialog
        id={id}
        open={open}
        onOpenChange={setOpen}
        title="Fuel the next build"
        titleSize="feature"
        aria-describedby={descriptionId}
        closeLabel="Close support options"
        size="md"
      >
        <Surface tone="info" variant="soft" texture="halftone-soft" padding={3} elevation="none">
          <Inline gap={3} wrap={false}>
            <Badge variant="solid" tone="emphasis" shape="square" tilt="right" aria-hidden="true">
              <FaHeart focusable="false" />
            </Badge>
            <Text id={descriptionId} size="body">
              Choose the way that works best for you. Every bit helps keep useful ideas moving.
            </Text>
          </Inline>
        </Surface>
        <Grid columns={{ base: 1, sm: 2 }} gap={4}>
          <Surface tone="accent" padding={4} elevation="md">
            <Stack gap={3}>
              <Link
                href="https://github.com/sponsors/mdopeace"
                target="_blank"
                startIcon={<FaGithub />}
                startIconSize="md"
                externalIndicator
              >
                <strong>GitHub Sponsors</strong>
              </Link>
              <Text size="sm">Help ship the next small tool</Text>
            </Stack>
          </Surface>
          <Surface tone="info" padding={4} elevation="md">
            <Stack gap={3}>
              <Link
                href="https://buymeacoffee.com/mdopeace"
                target="_blank"
                startIcon={<FaMugHot />}
                startIconSize="md"
                externalIndicator
              >
                <strong>Buy Me a Coffee</strong>
              </Link>
              <Text size="sm">Fuel a cup of curiosity</Text>
            </Stack>
          </Surface>
        </Grid>
      </Dialog>
    </>
  );
}
