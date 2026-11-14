"use client";
import { useId, useState } from "react";
import { FaGithub, FaHeart, FaMugHot } from "react-icons/fa6";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Link } from "../ui/Link";
import { Grid, Stack } from "../ui/Layout";
import { Surface } from "../ui/Surface";
import { Text } from "../ui/Typography";
export default function SupportDialog() {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <Button
        size="lg"
        aria-haspopup="dialog"
        aria-controls={id}
        onClick={() => setOpen(true)}
        endIcon={<FaHeart />}
      >
        Support my work
      </Button>
      <Dialog
        id={id}
        open={open}
        onOpenChange={setOpen}
        title="Fuel the next build"
        description="Choose the way that works best for you. Every bit helps keep useful ideas moving."
        closeLabel="Close support options"
        size="md"
      >
        <Grid columns={{ base: 1, sm: 2 }} gap={4}>
          <Surface tone="accent" elevation="sm" padding={4}>
            <Stack gap={3}>
              <Link
                href="https://github.com/sponsors/mdopeace"
                target="_blank"
                startIcon={<FaGithub />}
                externalIndicator
              >
                <strong>GitHub Sponsors</strong>
              </Link>
              <Text size="sm">Help ship the next small tool</Text>
            </Stack>
          </Surface>
          <Surface tone="info" elevation="sm" padding={4}>
            <Stack gap={3}>
              <Link
                href="https://buymeacoffee.com/mdopeace"
                target="_blank"
                startIcon={<FaMugHot />}
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
