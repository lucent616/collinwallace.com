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
    try { cfg = await fetch("data/site/forms.json").then(r => r.ok ? r.json() : null); } catch (e) { cfg = null; }
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
  hero: "assets/img/hero-postit.webp",
  portrait: "assets/img/portrait-postit.webp",
  wide: "assets/img/hero-wide.webp",
  full: "assets/img/full-length.webp",
  podium: "assets/img/speaking-podium.webp",
  podiumAlt: "assets/img/speaking-podium-alt.webp",
  teaching: "assets/img/teaching-whiteboard.webp"
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
      <img src="assets/img/book-cover.webp" alt="Perishable Knowledge — book cover"
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

// Substack cover images come from substackcdn.com as Cloudinary-style
// "fetch" URLs: https://substackcdn.com/image/fetch/<transforms>/<encoded src>.
// Inserting a w_<px> transform gets a resized copy straight from their CDN,
// so we never serve the full 1536px original for a thumbnail. Unknown URL
// shapes are passed through untouched.
const SUBSTACK_FETCH = /^(https:\/\/substackcdn\.com\/image\/fetch\/)([^/]+)(\/.+)$/;
function essayImage(url, width) {
  if (!url) return "";
  const m = url.match(SUBSTACK_FETCH);
  if (!m) return url;
  const transforms = m[2].split(",").filter((t) => !/^(w|h|c)_/.test(t));
  return m[1] + ["w_" + width, ...transforms].join(",") + m[3];
}

// Normalize a post from data/essays.json (snake_case) or the inline
// fallback in src/data.jsx (camelCase) into the shape EssayCard renders.
function normalizeEssay(e) {
  return {
    title: e.title || "",
    date: e.date || "",
    readTime: e.readTime || e.read_time || "",
    excerpt: e.excerpt || "",
    url: e.url || "",
    image: e.image || "",
    tags: Array.isArray(e.tags) ? e.tags : [],
  };
}

// One essay row: meta / title / excerpt, with the Substack cover as a
// fixed-crop thumbnail beside it. Falls back to text-only when there is no
// image or it fails to load (e.g. the CDN URL goes stale).
function EssayCard({ essay: e }) {
  const [thumbOk, setThumbOk] = useState(true);
  const hasThumb = !!e.image && thumbOk;
  const cardProps = e.url
    ? { href: e.url, target: "_blank", rel: "noopener noreferrer" }
    : { href: "#", onClick: (ev) => ev.preventDefault() };
  return (
    <a className={"essay-card" + (hasThumb ? " has-thumb" : "")} {...cardProps}>
      <div className="essay-body">
        <div className="essay-meta">
          <span>{e.date}</span>
          {e.readTime && <><span className="dot" /><span>{e.readTime}</span></>}
          {e.tags[0] && <><span className="dot" /><span>{e.tags[0]}</span></>}
        </div>
        <h3 className="essay-title">{e.title}</h3>
        <p className="essay-excerpt">{e.excerpt}</p>
      </div>
      {hasThumb && (
        <div className="essay-thumb">
          <img
            src={essayImage(e.image, 480)}
            srcSet={`${essayImage(e.image, 480)} 1x, ${essayImage(e.image, 960)} 2x`}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setThumbOk(false)}
          />
        </div>
      )}
    </a>
  );
}

Object.assign(window, { EmailCapture, Reveal, SectionHead, LogoStrip, ContactEmail, submitForm, Headshot, BookCover, Arrow, essayImage, normalizeEssay, EssayCard });
