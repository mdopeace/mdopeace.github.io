import LinkList from "../LinkList";
import Section from "../Section";

export default function Contact() {
  return (
    <Section label="Get in touch" id="contact" index="05">
      <LinkList
        quiet
        className="text-[15px]"
        items={[
          {
            label: "Mail",
            href: "mailto:md.correo.e@gmail.com",
          },
          {
            label: "WhatsApp",
            href: "https://wa.me/mdopeace",
            rel: "noopener noreferrer",
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
