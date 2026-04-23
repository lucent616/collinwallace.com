// Homepage
const HomeReveal = window.Reveal;
const { useState: useStateHome, useEffect: useEffectHome } = React;

function normalizeFeaturedEssay(e) {
  return {
    title: e.title || "",
    date: e.date || "",
    readTime: e.readTime || e.read_time || "",
    excerpt: e.excerpt || "",
    url: e.url || "",
    tags: Array.isArray(e.tags) ? e.tags : [],
  };
}

function HomePage({ go, tweaks }) {
  const [featured, setFeatured] = useStateHome(
    (window.DATA && window.DATA.essays ? window.DATA.essays : [])
      .slice(0, 3)
      .map(normalizeFeaturedEssay)
  );
  useEffectHome(() => {
    let cancelled = false;
    fetch("data/essays.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((payload) => {
        if (cancelled || !payload || !Array.isArray(payload.posts)) return;
        setFeatured(payload.posts.slice(0, 3).map(normalizeFeaturedEssay));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const venues = window.DATA.venues;
  const press = ["Bloomberg", "TechCrunch", "The Information", "Fortune", "Forbes", "The Verge"];

  const renderHero = () => {
    const layout = tweaks.heroLayout || "split-right";
    const headline = (
      <>
        <div className="eyebrow reveal in" style={{marginBottom: 20}}>Perishable Knowledge · Est. 2024</div>
        <h1 className="h-display">
          Writer. Investor.<br/>
          Entrepreneur.<br/>
          <span style={{color: "var(--accent-ink)", fontStyle: "italic"}}>Lecturer at Stanford GSB.</span>
        </h1>
        <p className="lede" style={{marginTop: 28, maxWidth: 560}}>
          I write about <em>Perishable Knowledge</em> — the idea that the best founders exploit time-bound information advantages. I'm a GP at Lobby Capital, a lecturer at Stanford GSB, and I'm writing a book by the same name.
        </p>
        <div style={{marginTop: 36, maxWidth: 520}}>
          <EmailCapture cta="Subscribe" placeholder="Your email address" />
          <div className="capture-note">
            {tweaks.subscriberCount && (
              <><strong>12,400+ readers.</strong> New essay every Tuesday. Unsubscribe in one click.</>
            )}
            {!tweaks.subscriberCount && (
              <>New essay every Tuesday. Unsubscribe in one click.</>
            )}
          </div>
        </div>
      </>
    );

    if (layout === "stacked") {
      return (
        <div style={{textAlign: "center"}}>
          <div style={{width:"100%", maxWidth: 360, margin: "0 auto 40px"}}><Headshot src="portrait" label="" objectPosition="center 30%" /></div>
          {headline}
        </div>
      );
    }
    if (layout === "split-left") {
      return (
        <div className="grid-hero" style={{gridTemplateColumns: "minmax(0,0.85fr) minmax(0,1.15fr)"}}>
          <div style={{width:"100%", maxWidth: 400}}><Headshot src="portrait" label="" objectPosition="center 30%" /></div>
          <div>{headline}</div>
        </div>
      );
    }
    if (layout === "inline-portrait") {
      return (
        <div>
          <div style={{display:"flex", alignItems:"center", gap: 20, marginBottom: 28}}>
            <div style={{width: 64, height: 64, borderRadius: "50%", overflow:"hidden", flex:"0 0 64px"}}>
              <img src={window.PHOTOS.portrait} alt="Collin Wallace" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 22%"}}/>
            </div>
            <div className="eyebrow">Perishable Knowledge · Est. 2024</div>
          </div>
          <h1 className="h-display">
            Writer. Investor. Entrepreneur.{" "}
            <span style={{color: "var(--accent-ink)", fontStyle: "italic"}}>Lecturer at Stanford GSB.</span>
          </h1>
          <p className="lede" style={{marginTop: 28, maxWidth: 640}}>
            I write about <em>Perishable Knowledge</em> — the idea that the best founders exploit time-bound information advantages. I'm a GP at Lobby Capital, a lecturer at Stanford GSB, and I'm writing a book by the same name.
          </p>
          <div style={{marginTop: 36, maxWidth: 520}}>
            <EmailCapture cta="Subscribe" placeholder="Your email address" />
            <div className="capture-note">
              {tweaks.subscriberCount && <><strong>12,400+ readers.</strong> New essay every Tuesday. Unsubscribe in one click.</>}
              {!tweaks.subscriberCount && <>New essay every Tuesday. Unsubscribe in one click.</>}
            </div>
          </div>
        </div>
      );
    }
    // default: split-right
    return (
        <div className="grid-hero">
        <div>{headline}</div>
        <div style={{width:"100%", maxWidth: 460, marginLeft: "auto"}}><Headshot src="portrait" label="" objectPosition="center 30%" /></div>
      </div>
    );
  };

  return (
    <div>
      {/* Hero */}
      <section className="section" style={{paddingTop: "calc(72px * var(--rhythm))"}}>
        <div className="container">
          {renderHero()}
        </div>
      </section>

      <hr className="rule" />

      {/* Featured essays */}
      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="The Newsletter"
            title="Recent essays."
            link={<a href="#/writing" className="btn-link" onClick={(e)=>{e.preventDefault();go("writing");}}>Read all essays <Arrow /></a>}
          />
          <div>
            {featured.map((e, i) => {
              const hasUrl = !!e.url;
              const cardProps = hasUrl
                ? { href: e.url, target: "_blank", rel: "noopener noreferrer" }
                : { href: "#", onClick: (ev) => ev.preventDefault() };
              return (
                <Reveal key={e.url || i} delay={i * 80}>
                  <a className="essay-card" {...cardProps}>
                    <div className="essay-meta">
                      <span>{e.date}</span>
                      {e.readTime && <><span className="dot" /><span>{e.readTime}</span></>}
                      {e.tags[0] && <><span className="dot" /><span>{e.tags[0]}</span></>}
                    </div>
                    <h3 className="essay-title">{e.title}</h3>
                    <p className="essay-excerpt">{e.excerpt}</p>
                  </a>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Book tease */}
      <section className="section" style={{background: "var(--bg-2)"}}>
        <div className="container">
          <div className="grid-2">
            <Reveal>
              <div style={{width:"100%", maxWidth: 320}}>
                <BookCover />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="eyebrow" style={{marginBottom: 18}}>The Book — In Progress</div>
              <h2 className="h-xl"><em>Perishable Knowledge.</em><br/>A book, in progress.</h2>
              <p className="lede" style={{marginTop: 24, maxWidth: 500}}>
                An argument for a new kind of expertise — one built not on what you know, but on how fast you can find the insight the market hasn't priced in yet.
              </p>
              <p className="body" style={{marginTop: 14, maxWidth: 500}}>
                Ten years of teaching, investing, and writing, distilled into a single framework for anyone building in the AI era. Expected early 2027.
              </p>
              <div style={{marginTop: 28, maxWidth: 440}}>
                <EmailCapture cta="Join waitlist" placeholder="Your email address" />
                <div className="capture-note">Tagged for the book list. No more than one update per month.</div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Speaking */}
      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Speaking"
            title="Where I've spoken."
            link={<a href="#/speaking" className="btn-link" onClick={(e)=>{e.preventDefault();go("speaking");}}>Invite me to speak <Arrow /></a>}
          />
          <Reveal>
            <LogoStrip items={venues} />
          </Reveal>
          <div style={{marginTop: 72, maxWidth: 820}}>
            <Reveal>
              <div className="quote">
                Collin brought our founders a framework they are still using a year later.
              </div>
              <div style={{marginTop: 16, display:"flex", gap: 12, alignItems:"center"}}>
                <div style={{width: 32, height: 1, background: "var(--ink-4)"}} />
                <div className="small"><strong style={{color:"var(--ink-2)"}}>Ashley Mayer</strong> · Head of Programs, Techstars</div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Press */}
      <section className="section-sm" style={{background: "var(--bg-2)", borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)"}}>
        <div className="container">
          <div className="eyebrow" style={{marginBottom: 28, textAlign:"center"}}>As seen in</div>
          <LogoStrip items={press} sans />
        </div>
      </section>

      {/* About teaser */}
      <section className="section">
        <div className="container">
          <div className="grid-2">
            <Reveal>
              <div style={{width:"100%", maxWidth: 460}}>
                <Headshot src="teaching" label="" objectPosition="center 25%" />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="eyebrow" style={{marginBottom: 18}}>About</div>
              <h2 className="h-xl">A short version of a longer story.</h2>
              <p className="body" style={{marginTop: 24, maxWidth: 520, fontSize: 17}}>
                I started a company, sold it to Grubhub, ran Techstars Silicon Valley, then spent years investing startups at Lobby Capital while teaching entrepreneurship and innovation at Stanford University. Somewhere in there I started writing on Sundays, and it quietly became the most important thing I do.
              </p>
              <div style={{marginTop: 32}}>
                <a href="#/about" className="btn btn-ghost" onClick={(e)=>{e.preventDefault();go("about");}}>
                  Read the full story <Arrow />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Big subscribe */}
      <section id="subscribe-footer" className="subscribe-hero">
        <div className="container" style={{position:"relative", zIndex:1}}>
          <div style={{maxWidth: 760}}>
            <div className="eyebrow" style={{color:"color-mix(in oklab, var(--paper) 60%, transparent)", marginBottom: 20}}>PERISHABLE KNOWLEDGE</div>
            <h2>One essay, every Tuesday morning.</h2>
            <p>
              Short, specific, and always about something that will be out of date soon. {tweaks.subscriberCount && "Join 12,400+ operators, investors, founders, and students already reading."}
            </p>
            <div style={{maxWidth: 520}}>
              <EmailCapture cta="Subscribe" placeholder="Your email address" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { HomePage });
