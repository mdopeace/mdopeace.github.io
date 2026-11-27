"use client";

import { useId, useState, type ReactNode } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { Button } from "@mdopeace/ui/Button";
import { Dialog, type DialogProps } from "@mdopeace/ui/Dialog";

export default function ProjectDetails({
  name,
  secondary,
  titleSize,
  children,
}: {
  name: string;
  secondary: boolean;
  titleSize?: DialogProps["titleSize"];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <Button
        size="md"
        variant={secondary ? "secondary" : "primary"}
        aria-label={`View project: ${name}`}
        aria-haspopup="dialog"
        aria-controls={id}
        onClick={() => setOpen(true)}
        endIcon={<FaArrowRightLong />}
      >
        View project
      </Button>
      <Dialog
        id={id}
        open={open}
        onOpenChange={setOpen}
        title={name}
        titleSize={titleSize}
        closeLabel={`Close ${name} project`}
        size="lg"
      >
        {children}
      </Dialog>
    </>
  );
}
