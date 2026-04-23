// /about page

function AboutPage({ go }) {
  return (
    <div>
      <section className="section">
        <div className="container">
          <div className="grid-hero">
            <div>
              <div className="eyebrow" style={{marginBottom: 18}}>About</div>
              <h1 className="h-xl">
                I build things, pick things, teach things, and write about all of it on Saturdays.
              </h1>
              <p className="lede" style={{marginTop: 24, maxWidth: 560}}>
                The version that fits on a business card: writer, investor, entrepreneur, lecturer at Stanford GSB. The version that doesn't is below.
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
            <p className="body" style={{fontSize: 18}}>
              I started my first company, <strong>Zero Storefront</strong>, out of a frustration with how online ordering worked for small restaurants. We built a product, we found a thesis the market eventually agreed with, and in 2014 Grubhub acquired us.
            </p>
            <p className="body" style={{fontSize: 18}}>
              After the acquisition I spent a year running point on the integration, then joined <strong>Techstars</strong> as Managing Director of the Silicon Valley program. For three years I invested in and mentored roughly forty companies a year. It was the fastest feedback loop I have ever been inside of, and it reset everything I thought I knew about early-stage diligence.
            </p>
            <p className="body" style={{fontSize: 18}}>
              From Techstars I went to <strong>Stanford GSB</strong> to co-teach Startup Garage, the school's flagship entrepreneurship course. I have been doing it every year since. Teaching is where the ideas in this newsletter get stress-tested by a hundred smart strangers before they ever reach print.
            </p>
            <p className="body" style={{fontSize: 18}}>
              In 2023 I joined <strong>Lobby Capital</strong> as a General Partner, where I lead our early-stage practice. I focus on the places where the old mental models for founder evaluation are breaking down — which is, increasingly, all of them.
            </p>
            <p className="body" style={{fontSize: 18}}>
              Somewhere in there I started publishing <em>Perishable Knowledge</em> on Saturday mornings. It began as a private note to myself and became, quietly, the most important thing I do. The book I'm writing by the same name is a longer argument for why.
            </p>
            <p className="body" style={{fontSize: 18}}>
              I live in the Bay Area with my family. I answer my own email.
            </p>
          </div>
        </div>
      </section>

      <section className="section-sm" style={{background:"var(--bg-2)", borderTop:"1px solid var(--rule)", borderBottom:"1px solid var(--rule)"}}>
        <div className="container">
          <div className="eyebrow" style={{marginBottom: 24, textAlign:"center"}}>Credentials</div>
          <LogoStrip items={window.DATA.credentials} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Press" title="Featured in." />
          <div className="grid-3">
            {window.DATA.press.slice(0, 6).map((p, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="press-card">
                  <div className="mono" style={{fontSize: 11, letterSpacing:"0.14em", color:"var(--accent-ink)", marginBottom: 12}}>{p.outlet.toUpperCase()}</div>
                  <div className="h-md" style={{marginBottom: 14, fontSize: 19}}>{p.title}</div>
                  <div className="quote" style={{fontSize: 15, lineHeight: 1.5, color:"var(--ink-3)"}}>{p.quote}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{background:"var(--bg-2)", borderTop:"1px solid var(--rule)"}}>
        <div className="container">
          <SectionHead eyebrow="Podcasts" title="Conversations." />
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap: 16}}>
            {window.DATA.podcasts.map((p, i) => (
              <a key={i} href="#" onClick={(e)=>e.preventDefault()} className="podcast-card">
                <div className="podcast-art">{p.title.charAt(0)}</div>
                <div style={{minWidth: 0}}>
                  <div className="mono" style={{fontSize: 10, letterSpacing:"0.14em", color:"var(--ink-3)", marginBottom: 4}}>PODCAST</div>
                  <div className="h-md" style={{fontSize: 16, lineHeight: 1.2, marginBottom: 4}}>{p.title}</div>
                  <div className="small">{p.episode}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="subscribe-hero">
        <div className="container" style={{position:"relative", zIndex:1}}>
          <div style={{maxWidth: 720}}>
            <h2>Thanks for reading this far.</h2>
            <p>If you'd like to keep in touch, the newsletter is the best way.</p>
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
