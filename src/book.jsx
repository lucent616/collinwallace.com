// /book page

const BOOK_FALLBACK = {
  status_pill: "In progress — 2026",
  title: "Perishable Knowledge.",
  hero_blurb: "",
  waitlist_note: "You'll get chapter drafts, notes from the margins, and a heads up a month before publication.",
  argument_eyebrow: "The Argument",
  argument_heading: "",
  argument_paragraphs: [],
  toc_eyebrow: "Table of Contents",
  toc_caption: "Placeholder — final outline pending. Subject to change.",
  toc: [],
  endorsements_eyebrow: "Endorsements",
  endorsements_heading: "Early readers.",
  endorsements: [],
  author_note_eyebrow: "Why I'm Writing This",
  author_note_heading: "A short note from the author.",
  author_note_paragraphs: [],
  author_note_signature: "— Collin",
  waitlist_heading: "Be the first to read it.",
  waitlist_subheading: "Waitlist subscribers get early chapters and a month's notice before publication."
};

function BookPage({ go }) {
  const book = useCmsData("data/site/book.json", BOOK_FALLBACK);

  return (
    <div>
      <section className="section">
        <div className="container">
          <div className="grid-hero" style={{gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 80, alignItems:"center"}}>
            <div style={{width:"100%", maxWidth: 300}}>
              <BookCover />
            </div>
            <div>
              <div className="pill" style={{marginBottom: 18}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)"}}/> {book.status_pill}
              </div>
              <h1 className="h-xl"><em>{book.title}</em></h1>
              <p className="lede" style={{marginTop: 22, maxWidth: 540}}>
                <Md>{book.hero_blurb}</Md>
              </p>
              <div style={{marginTop: 32, maxWidth: 480}}>
                <EmailCapture cta="Join waitlist" placeholder="Your email address" />
                <div className="capture-note">{book.waitlist_note}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="rule" />

      {/* Argument */}
      <section className="section">
        <div className="container-read">
          <div className="eyebrow" style={{marginBottom: 16}}>{book.argument_eyebrow}</div>
          <h2 className="h-lg" style={{marginBottom: 28}}>{book.argument_heading}</h2>
          <div className="stack-md">
            {(book.argument_paragraphs || []).map((p, i) => (
              <p key={i} className="body" style={{fontSize: 17.5}}>
                <Md>{p}</Md>
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{background: "var(--bg-2)", borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)"}}>
        <div className="container">
          <div className="grid-2" style={{gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)", alignItems:"start"}}>
            <div>
              <div className="eyebrow" style={{marginBottom: 16}}>{book.toc_eyebrow}</div>
              <p className="small">{book.toc_caption}</p>
            </div>
            <div>
              {(book.toc || []).map(({ number, title }, i) => (
                <div key={i} style={{
                  display:"grid", gridTemplateColumns:"60px 1fr", gap: 20,
                  padding: "18px 0", borderTop: i === 0 ? "1px solid var(--rule)" : "none",
                  borderBottom: "1px solid var(--rule)"
                }}>
                  <div className="mono" style={{color:"var(--accent-ink)", fontSize: 12, letterSpacing:"0.1em"}}>{number}</div>
                  <div className="h-md">{title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Endorsements */}
      <section className="section">
        <div className="container">
          <div className="eyebrow" style={{marginBottom: 16}}>{book.endorsements_eyebrow}</div>
          <h2 className="h-lg" style={{marginBottom: 36}}>{book.endorsements_heading}</h2>
          <div className="grid-3">
            {(book.endorsements || []).map((e, i) => (
              <div key={i} className="press-card">
                <div className="quote" style={{fontSize: 19}}>
                  {e.quote}
                </div>
                <div style={{marginTop: 18, display:"flex", gap: 10, alignItems:"center"}}>
                  <div style={{width: 28, height: 1, background:"var(--ink-4)"}} />
                  <div className="small">— {e.person}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Author note */}
      <section className="section" style={{background: "var(--bg-2)"}}>
        <div className="container-read">
          <div className="eyebrow" style={{marginBottom: 16}}>{book.author_note_eyebrow}</div>
          <h2 className="h-lg" style={{marginBottom: 24}}>{book.author_note_heading}</h2>
          <div className="stack-md">
            {(book.author_note_paragraphs || []).map((p, i) => (
              <p key={i} className="body" style={{fontSize: 17}}>
                <Md>{p}</Md>
              </p>
            ))}
            <p className="body" style={{fontSize: 17, fontStyle:"italic", color:"var(--ink-3)"}}>
              {book.author_note_signature}
            </p>
          </div>
        </div>
      </section>

      <section className="subscribe-hero">
        <div className="container" style={{position:"relative", zIndex:1}}>
          <div style={{maxWidth: 720}}>
            <h2>{book.waitlist_heading}</h2>
            <p>{book.waitlist_subheading}</p>
            <div style={{maxWidth: 520}}>
              <EmailCapture cta="Join waitlist" placeholder="Your email address" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { BookPage });
