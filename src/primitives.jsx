// Shared primitives: EmailCapture, Reveal, SectionHead, etc.

const { useState, useEffect, useRef } = React;

function EmailCapture({ placeholder = "you@domain.com", cta = "Subscribe", note, tag, compact, dark }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (!email || !/.+@.+\..+/.test(email)) return;
    setDone(true);
    setTimeout(() => { setDone(false); setEmail(""); }, 4200);
  };
  if (done) {
    return (
      <div className="capture-success">
        <span style={{fontSize:20}}>✓</span>
        <span>You're on the list. Next essay lands this week.</span>
      </div>
    );
  }
  return (
    <div>
      <form className="capture" onSubmit={submit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          required
        />
        <button type="submit">{cta}</button>
      </form>
      {note && <div className="capture-note">{note}</div>}
    </div>
  );
}

function Reveal({ children, delay = 0, as: As = "div", ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setTimeout(() => setShown(true), delay);
          io.disconnect();
        }
      });
    }, { threshold: 0.12 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [delay]);
  return <As ref={ref} className={"reveal" + (shown ? " in" : "") + (rest.className ? " " + rest.className : "")} {...rest}>{children}</As>;
}

function SectionHead({ eyebrow, title, link, children }) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <div className="eyebrow" style={{marginBottom: 10}}>{eyebrow}</div>}
        {title && <h2 className="h-lg">{title}</h2>}
        {children}
      </div>
      {link}
    </div>
  );
}

function LogoStrip({ items, sans }) {
  return (
    <div className="logo-strip">
      {items.map((l, i) => {
        if (typeof l === "string") return <div key={i} className={"logo" + (sans ? " sans" : "")}>{l}</div>;
        const img = <img src={l.logo} alt={l.name} title={l.name} style={l.scale ? {height: (44 * l.scale) + "px", maxHeight: "none"} : undefined} />;
        return l.url
          ? <a key={i} className={"logo logo-img" + (l.scale ? " tall" : "")} href={l.url} target="_blank" rel="noopener noreferrer" aria-label={l.name}>{img}</a>
          : <div key={i} className={"logo logo-img" + (l.scale ? " tall" : "")} aria-label={l.name}>{img}</div>;
      })}
    </div>
  );
}

// Obfuscated contact address — assembled at click time so it never sits in the HTML as text.
function ContactEmail({ label = "Email me", className = "" }) {
  const parts = ["tooltip.clark.0n", "icloud", "com"];
  const onClick = (e) => { e.preventDefault(); window.location.href = "mailto:" + parts[0] + "@" + parts[1] + "." + parts[2]; };
  return <a href="#email" onClick={onClick} className={className}>{label}</a>;
}


// Form relay. Posts to Web3Forms when an access key is configured in data/site/forms.json;
// otherwise falls back to opening a prefilled email so a message is never silently dropped.
async function submitForm(kind, fields) {
  let cfg = window.__CMS_CACHE["data/site/forms.json"];
  if (!cfg) {
    try { cfg = await fetch("data/site/forms.json", { cache: "no-store" }).then(r => r.ok ? r.json() : null); } catch (e) { cfg = null; }
    if (cfg) window.__CMS_CACHE["data/site/forms.json"] = cfg;
  }
  const key = cfg && cfg.web3forms_access_key;
  const prefix = (cfg && cfg.subject_prefix) || "[collinwallace.com]";
  const subject = prefix + " " + kind + (fields.name ? " from " + fields.name : "");
  if (key) {
    const body = { access_key: key, subject, from_name: fields.name || "Website form", replyto: fields.email || "", form: kind, ...fields };
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(body)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) throw new Error(json.message || "Submission failed");
    return { via: "relay" };
  }
  // Fallback: prefilled email
  const lines = Object.entries(fields).filter(([k, v]) => v).map(([k, v]) => k + ": " + v).join("\n");
  const parts = ["tooltip.clark.0n", "icloud", "com"];
  window.location.href = "mailto:" + parts[0] + "@" + parts[1] + "." + parts[2] + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines);
  return { via: "mailto" };
}

// Editorial headshot — real photo
const PHOTOS = {
  hero: "assets/hero-postit.jpg",
  portrait: "assets/portrait-postit.jpg",
  wide: "assets/hero-wide.jpg",
  full: "assets/full-length.jpg",
  podium: "assets/speaking-podium.jpg",
  podiumAlt: "assets/speaking-podium-alt.jpg",
  teaching: "assets/teaching-whiteboard.jpg"
};
function Headshot({ src = "hero", label, alt = "Collin Wallace", objectPosition = "center" }) {
  const url = PHOTOS[src] || src;
  return (
    <div className="headshot" style={{background: "var(--ink)"}}>
      <img
        src={url}
        alt={alt}
        style={{
          position:"absolute", inset:0, width:"100%", height:"100%",
          objectFit:"cover", objectPosition,
          display:"block"
        }}
      />
      {label ? <div className="label">{label}</div> : null}
    </div>
  );
}
window.PHOTOS = PHOTOS;

function BookCover({ small }) {
  return (
    <div style={{
      position:"relative",
      aspectRatio: "2/3",
      borderRadius: 2,
      overflow: "hidden",
      boxShadow: "0 1px 0 rgba(31,27,23,0.04), 0 24px 50px -20px rgba(31,27,23,0.35), -6px 0 0 -3px rgba(0,0,0,0.18)",
      maxWidth: small ? 220 : "100%"
    }}>
      <img src="assets/book-cover.jpg" alt="Perishable Knowledge — book cover"
        style={{width:"100%", height:"100%", objectFit:"cover", display:"block"}} />
    </div>
  );
}

// Simple SVG arrow
function Arrow({ size = 14 }) {
  return (
    <svg className="arrow" width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

Object.assign(window, { EmailCapture, Reveal, SectionHead, LogoStrip, ContactEmail, submitForm, Headshot, BookCover, Arrow });
