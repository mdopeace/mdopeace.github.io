import CopyEmailButton from "../CopyEmailButton";
import Section from "../Section";
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
          <div className="contact-speech">“What are you building?”</div>
          <svg className="contact-illustration" viewBox="0 0 440 330" role="img" aria-labelledby="signal-title signal-desc">
            <title id="signal-title">A maker at a signal desk</title>
            <desc id="signal-desc">A cheerful comic character wearing headphones, ready to hear your idea.</desc>
            <g stroke="var(--ink)" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round">
              <path fill="var(--blue)" d="M45 268h350v21H45z" />
              <path fill="var(--accent-2)" d="M87 288h263v17H87z" />
              <path fill="var(--accent)" d="M123 230h194v38H123z" />
              <path fill="var(--card)" d="M143 241h92v16h-92z" />
              <circle cx="280" cy="249" r="8" fill="var(--accent-2)" />
              <path fill="var(--accent-2)" d="M191 104c0-37 25-63 61-63s61 26 61 63v49H191z" />
              <path fill="#d99268" d="M205 112c0-31 19-51 47-51s47 20 47 51v30c0 30-19 48-47 48s-47-18-47-48z" />
              <path fill="var(--ink)" d="M201 111c-5-40 17-66 52-66 31 0 50 19 53 48-17-9-34-13-52-10-15 15-32 24-53 28z" />
              <path fill="none" d="M225 126h2m43 0h2" strokeWidth="8" />
              <path fill="none" d="M234 151q17 15 35 0" strokeWidth="5" />
              <path fill="var(--blue)" d="M181 215c9-31 34-47 71-47s62 16 71 47v42H181z" />
              <path fill="var(--accent)" d="M204 176q-21 7-25 39l-28 17q-9 7-2 16 7 8 16 2l40-21" />
              <path fill="#d99268" d="M147 236q-10-6-18 2l-13 12q-7 8 1 15 7 5 14-1l18-15" />
              <path fill="var(--accent-2)" d="M301 176q21 7 25 39l28 17q9 7 2 16-7 8-16 2l-40-21" />
              <path fill="#d99268" d="M358 236q10-6 18 2l13 12q7 8-1 15-7 5-14-1l-18-15" />
              <path fill="none" d="M195 114q-13-13-2-25m114 25q13-13 2-25" strokeWidth="9" />
              <path fill="var(--accent)" d="M188 211h19v31h-19zm118 0h19v31h-19z" />
              <path className="contact-mic" fill="var(--ink)" d="M332 181h10v39h-10z" />
              <path fill="var(--ink)" d="M326 219h22v8h-22z" />
            </g>
            <path className="contact-signal contact-signal-one" d="M343 111q22 17 0 34" />
            <path className="contact-signal contact-signal-two" d="M361 99q36 29 0 58" />
            <g className="contact-spark" fill="var(--accent-2)" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round">
              <path d="m102 87 7-18 7 18 18 7-18 7-7 18-7-18-18-7z" />
              <path d="m375 163 5-13 5 13 13 5-13 5-5 13-5-13-13-5z" />
            </g>
          </svg>
          <span className="contact-art-caption">Your turn · send a signal</span>
        </div>
      </div>
    </Section>
  );
}
