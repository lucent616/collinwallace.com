// /about page

const ABOUT_FALLBACK = {
  eyebrow: "About",
  headline: "I build things, fund things, teach things, and write about all of it every week.",
  lede: "The version that fits on a business card: writer, investor, entrepreneur, lecturer at Stanford GSB. The version that doesn't is below.",
  bio_paragraphs: [],
  outro_heading: "Thanks for reading this far.",
  outro_subheading: "If you'd like to keep in touch, the newsletter is the best way."
};

function AboutPage({ go }) {
  const about = useCmsData("data/site/about.json", ABOUT_FALLBACK);
  const credentials = useCmsData("data/site/credentials.json", { items: window.DATA.credentials });
  const press = useCmsData("data/site/press.json", { items: window.DATA.press });
  const podcasts = useCmsData("data/site/podcasts.json", { items: window.DATA.podcasts });
  const videos = useCmsData("data/site/videos.json", { items: [] });
  const featured = press.featured || press.items || [];
  const more = press.more || [];

  return (
    <div>
      <section className="section">
        <div className="container">
          <div className="grid-hero">
            <div>
              <div className="eyebrow" style={{marginBottom: 18}}>{about.eyebrow}</div>
              <h1 className="h-xl">{about.headline}</h1>
              <p className="lede" style={{marginTop: 24, maxWidth: 560}}>
                <Md>{about.lede}</Md>
              </p>
            </div>
            <div style={{width:"100%", maxWidth: 460, marginLeft:"auto"}}>
              <Headshot src="full" label="" objectPosition="center 15%" />
            </div>
          </div>
        </div>
      </section>

      <hr className="rule" />

      <section className="section">
        <div className="container-read">
          <div className="stack-md">
            {(about.bio_paragraphs || []).map((p, i) => (
              <p key={i} className="body" style={{fontSize: 18}}>
                <Md>{p}</Md>
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm" style={{background:"var(--bg-2)", borderTop:"1px solid var(--rule)", borderBottom:"1px solid var(--rule)"}}>
        <div className="container">
          <div className="eyebrow" style={{marginBottom: 24, textAlign:"center"}}>Credentials</div>
          <LogoStrip items={credentials.items || []} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Press" title="Featured in." />
          <div className="grid-3">
            {featured.slice(0, 6).map((p, i) => {
              const card = (
                <div className="press-card">
                  <div className="press-top">
                    <div className="mono" style={{fontSize: 11, letterSpacing:"0.14em", color:"var(--accent-ink)"}}>{(p.outlet || "").toUpperCase()}</div>
                    {p.date && <div className="mono press-date">{p.date}</div>}
                  </div>
                  <div className="h-md" style={{marginBottom: 14, fontSize: 19}}>{p.title}</div>
                  <div className={p.pull ? "quote" : "body"} style={{fontSize: 15, lineHeight: 1.5, color:"var(--ink-3)"}}>{p.quote}</div>
                  {p.url && <div className="press-read">Read <Arrow size={12} /></div>}
                </div>
              );
              return (
                <Reveal key={i} delay={i * 60}>
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none", color:"inherit"}}>{card}</a>
                  ) : card}
                </Reveal>
              );
            })}
          </div>
          {more.length > 0 && (
            <div className="press-more">
              <div className="eyebrow" style={{marginBottom: 14}}>More coverage</div>
              <div className="press-more-grid">
                {more.map((p, i) => (
                  <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="press-more-item">
                    <span className="press-more-outlet">{p.outlet}</span>
                    <span className="press-more-title">{p.title}</span>
                    <span className="mono press-more-date">{p.date}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{background:"var(--bg-2)", borderTop:"1px solid var(--rule)"}}>
        <div className="container">
          <SectionHead eyebrow="Podcasts" title="Conversations." />
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap: 16}}>
            {(podcasts.items || []).map((p, i) => {
              const inner = (
                <>
                  {p.art
                    ? <img className="podcast-art podcast-art-img" src={p.art} alt={p.title} loading="eager" />
                    : <div className="podcast-art">{(p.title || "?").charAt(0)}</div>}
                  <div style={{minWidth: 0}}>
                    <div className="mono" style={{fontSize: 10, letterSpacing:"0.14em", color:"var(--ink-3)", marginBottom: 4}}>{(p.host || "PODCAST").toUpperCase()}{p.date ? " · " + p.date.toUpperCase() : ""}</div>
                    <div className="h-md" style={{fontSize: 16, lineHeight: 1.2, marginBottom: 4}}>{p.title}</div>
                    <div className="small">{p.episode}</div>
                  </div>
                </>
              );
              return (
                <a key={i} href={p.url || "#"} target="_blank" rel="noopener noreferrer" className="podcast-card">{inner}</a>
              );
            })}
          </div>
        </div>
      </section>

      {(videos.items || []).length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead eyebrow="On Video" title="Talks and interviews." />
            <div className="video-grid">
              {(videos.items || []).map((v, i) => (
                <a key={i} href={"https://www.youtube.com/watch?v=" + v.id} target="_blank" rel="noopener noreferrer" className="video-card">
                  <div className="video-thumb">
                    <img src={"assets/video/" + v.id + ".jpg"} alt={v.title} loading="eager" />
                    <span className="video-play" aria-hidden="true">▶</span>
                  </div>
                  <div className="mono" style={{fontSize: 10, letterSpacing:"0.14em", color:"var(--ink-3)", margin:"12px 0 6px"}}>{(v.channel || "").toUpperCase()}{v.date ? " · " + v.date : ""}</div>
                  <div className="h-md" style={{fontSize: 16, lineHeight: 1.25}}>{v.title}</div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="subscribe-hero">
        <div className="container" style={{position:"relative", zIndex:1}}>
          <div style={{maxWidth: 720}}>
            <h2>{about.outro_heading}</h2>
            <p>{about.outro_subheading}</p>
            <div style={{maxWidth: 520}}>
              <EmailCapture cta="Subscribe" placeholder="Your email address" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { AboutPage });
