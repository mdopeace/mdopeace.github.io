import { Image } from "@mdopeace/ui/Image";
import styles from "./project-media.module.css";

export default function ProjectImage({ src, alt, width, height, loading = "lazy" }: {
  src: string;
  alt: string;
  width: number;
  height: number;
  loading?: "lazy" | "eager";
}) {
  return <Image src={src} alt={alt} width={width} height={height} loading={loading} className={styles.screenshot} />;
}
