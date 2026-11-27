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
    <header id="top" className="hero-layout">
      <Surface padding={{ base: 5, md: 6, lg: 8 }} border="strong" className="hero-copy">
        <Stack gap={{ base: 4, md: 5, lg: 7 }}>
          <Inline gap={4}>
            <Badge variant="solid" tone="accent" size="md">
              Issue 01 · The maker
            </Badge>
          </Inline>
          <Stack gap={3}>
            <Text variant="eyebrow" tone="muted">
              Software Engineer · Bengaluru
            </Text>
            <Heading level={1} size="display-compact">
              Md Mostafijur <span className="hero-name">Rahman</span>
            </Heading>
          </Stack>
          <Stack gap={3}>
            <Text size="lg">
              I notice the little frictions that get in the way of a good
              experience—and I like figuring out how to make them disappear.
            </Text>
            <Text size="sm" tone="muted" className="hero-summary-copy">
              At Tracxn, I work across the web platform. Outside work, I turn
              the things I wish existed into small, useful tools.
            </Text>
          </Stack>
          <Inline gap={3} className="hero-actions">
            <Link variant="primary" href="#work" endIcon={<FaArrowDown style={{ transform: "rotate(-45deg)" }} />}>
              See my work
            </Link>
            <PortfolioSummary />
            <Link variant="secondary" href="#story" endIcon={<FaArrowDown style={{ transform: "rotate(-45deg)" }} />}>
              How I think
            </Link>
          </Inline>
        </Stack>
      </Surface>
      <Surface tone="accent" padding={0} border="strong" className="hero-art gameboy-stage">
        <TetrisGameboy />
      </Surface>
    </header>
  );
}
