import CopyEmailButton from "../CopyEmailButton";
import Section from "../Section";
import Image from "next/image";
import { FaGithub, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";

const email = "md.correo.e@gmail.com";

const socialLinks = [
  { label: "GitHub", href: "https://github.com/mdopeace", icon: FaGithub },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/mdopeace", icon: FaLinkedinIn },
  { label: "WhatsApp", href: "https://wa.me/mdopeace", icon: FaWhatsapp },
];

export default function Contact() {
  return (
    <Section label="Get in touch" id="contact" index="05">
      <div className="contact-grid">
        <div className="contact-copy">
          <span className="comic-label">CH 05 · OPEN CHANNEL</span>
          <h3 className="contact-headline">Got an idea that won’t leave you alone?</h3>
          <p className="contact-description">
            If you’re building something useful, stuck on a tricky problem, or
            just want to talk about the work, send a signal. I’d love to hear
            what you’re thinking about.
          </p>

          <div className="contact-actions">
            <a className="button-comic contact-email-button" href={`mailto:${email}`}>
              Start a conversation <span className="external-arrow" aria-hidden="true">↗</span>
            </a>
            <CopyEmailButton email={email} />
          </div>
          <div className="contact-social-block">
            <p className="contact-social-label">Find me elsewhere</p>
            <div className="contact-socials">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                  <Icon className="social-icon" aria-hidden="true" focusable="false" />
                  <span>{label}</span>
                  <span className="external-arrow" aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="contact-art comic-panel" aria-label="A little signal desk, ready for your message">
          <span className="contact-stamp">SIGNAL READY</span>
          <div className="contact-thought" aria-label="What are you building?">
            <Image className="contact-thought-image" src="/contact-thought-bubble.png" alt="" fill unoptimized sizes="(max-width: 800px) 45vw, 230px" />
            <span>“What are you<br />building?”</span>
          </div>
          <div className="contact-illustration" role="img" aria-label="A seated maker pauses to think beside a laptop">
            <Image className="contact-maker-image" src="/contact-maker.png" alt="" fill unoptimized sizes="(max-width: 800px) 90vw, 440px" />
            <svg className="contact-effects" viewBox="0 0 440 330" aria-hidden="true">
              <g className="contact-spark" fill="var(--accent-2)" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round">
                <path transform="translate(-30 0)" d="m89 131 6-15 6 15 15 6-15 6-6 15-6-15-15-6z" />
                <path transform="translate(30 0)" d="m380 197 5-12 5 12 12 5-12 5-5 12-5-12-12-5z" />
              </g>
            </svg>
          </div>
          <span className="contact-art-caption">Your turn · send a signal</span>
        </div>
      </div>
    </Section>
  );
}
