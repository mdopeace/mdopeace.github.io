import { FaArrowDown } from "react-icons/fa6";
import TetrisGameboy from "../hero/TetrisGameboy";
import { PortfolioSummary } from "../portfolio/PortfolioSummary";
import { Surface } from "@mdopeace/ui/Surface";
import { Stack, Inline } from "@mdopeace/ui/Layout";
import { Heading, Text } from "@mdopeace/ui/Typography";
import { Badge } from "@mdopeace/ui/Badge";
import { Link } from "@mdopeace/ui/Link";
export default function Hero() {
  return (
    <Surface
      as="header"
      id="top"
      padding={0}
      border="strong"
      className="hero-layout"
    >
      <div className="hero-copy">
        <Stack gap={7}>
          <Inline gap={4}>
            <Badge variant="solid" tone="accent" size="md">
              Issue 01 · The maker
            </Badge>
          </Inline>
          <Stack gap={3}>
            <Text variant="eyebrow" tone="muted">
              Software Engineer · Bengaluru
            </Text>
            <Heading level={1} size="display">
              Md Mostafijur <span className="hero-name">Rahman</span>
            </Heading>
          </Stack>
          <Stack gap={3}>
            <Text size="lg">
              I notice the little frictions that get in the way of a good
              experience—and I like figuring out how to make them disappear.
            </Text>
            <PortfolioSummary>
              At Tracxn, I work across the web platform. Outside work, I turn
              the things I wish existed into small, useful tools.
            </PortfolioSummary>
          </Stack>
          <Inline gap={3}>
            <Link variant="primary" href="#work" endIcon={<FaArrowDown style={{ transform: "rotate(-45deg)" }} />}>
              See what I’ve made
            </Link>
            <Link variant="secondary" href="#story" endIcon={<FaArrowDown style={{ transform: "rotate(-45deg)" }} />}>
              How I think
            </Link>
          </Inline>
        </Stack>
      </div>
      <div className="hero-art gameboy-stage">
        <TetrisGameboy />
      </div>
    </Surface>
  );
}
