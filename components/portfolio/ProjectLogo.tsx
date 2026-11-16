import { FaImage } from "react-icons/fa6";
import { Image } from "@mdopeace/ui/Image";
import styles from "./project-media.module.css";

/** Adjacent project headings already name the app, so its logo is decorative. */
export default function ProjectLogo({ src }: { src: string }) {
  return <Image src={src} alt="" width={32} height={32} radius="md" className={styles.logo} fallback={<FaImage />} />;
}
