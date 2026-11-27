import { FaImage } from "react-icons/fa6";
import { Image } from "@mdopeace/ui/Image";
import styles from "./project-media.module.css";

/** Adjacent project headings already name the app, so its logo is decorative. */
export default function ProjectLogo({ src, compact = false }: { src: string; compact?: boolean }) {
  const size = compact ? 24 : 32;
  return (
    <Image src={src} alt="" width={size} height={size}
      radius={compact ? "none" : "md"} className={compact ? undefined : styles.logo} fallback={<FaImage />} />
  );
}
