import LinkList from "../LinkList";
import Section from "../Section";

export default function Contact() {
  return (
    <Section label="Get in touch">
      <LinkList
        quiet
        className="text-[15px]"
        items={[
          {
            label: "md.correo.e@gmail.com",
            href: "mailto:md.correo.e@gmail.com",
          },
          {
            label: "GitHub",
            href: "https://github.com/mdopeace",
            rel: "noopener noreferrer",
          },
          {
            label: "LinkedIn",
            href: "https://www.linkedin.com/in/mdopeace",
            rel: "noopener noreferrer",
          },
        ]}
      />
    </Section>
  );
}
