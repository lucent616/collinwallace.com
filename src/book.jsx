// /book page

function BookPage({ go }) {
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
                <span style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)"}}/> In progress — 2026
              </div>
              <h1 className="h-xl"><em>Perishable Knowledge.</em></h1>
              <p className="lede" style={{marginTop: 22, maxWidth: 540}}>
                Why the best founders exploit time-bound information advantages — and how the rest of us can build a practice around finding them.
              </p>
              <div style={{marginTop: 32, maxWidth: 480}}>
                <EmailCapture cta="Join waitlist" placeholder="Your email address" />
                <div className="capture-note">You'll get chapter drafts, notes from the margins, and a heads up a month before publication.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="rule" />

      {/* Argument */}
      <section className="section">
        <div className="container-read">
          <div className="eyebrow" style={{marginBottom: 16}}>The Argument</div>
          <h2 className="h-lg" style={{marginBottom: 28}}>
            Codified knowledge is becoming free. That changes what it means to be an expert.
          </h2>
          <div className="stack-md">
            <p className="body" style={{fontSize: 17.5}}>
              For most of the last century, expertise meant access to a library and a few years to read it. Codified knowledge — the kind you can look up, cite, and test against — was the moat. It was hard to acquire and hard to fake.
            </p>
            <p className="body" style={{fontSize: 17.5}}>
              That era is ending. Not because knowledge is less valuable, but because the cost of retrieving and synthesizing it has collapsed. Anyone can ask a good question and get a competent answer in seconds. Which means the advantage has moved.
            </p>
            <p className="body" style={{fontSize: 17.5}}>
              It has moved upstream, to the act of picking what to look into in the first place. It has moved sideways, into the relationships and contexts that produce non-public information. And it has moved forward, into a strange new resource I have started calling <em>perishable knowledge</em> — insights that are only true for a little while, that degrade as they spread, and that reward the people who get to them first and act on them fastest.
            </p>
            <p className="body" style={{fontSize: 17.5}}>
              This book is an attempt to take that seriously as a skill, a practice, and — for founders and investors especially — a strategy. It draws on a decade of building and investing in startups, five years of teaching the Startup Garage course at Stanford, and the essays I have been publishing every Saturday to an audience of operators, investors, and students figuring this out alongside me.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{background: "var(--bg-2)", borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)"}}>
        <div className="container">
          <div className="grid-2" style={{gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)", alignItems:"start"}}>
            <div>
              <div className="eyebrow" style={{marginBottom: 16}}>Table of Contents</div>
              <p className="small">Placeholder — final outline pending. Subject to change.</p>
            </div>
            <div>
              {[
                ["I.", "The End of Codified Expertise"],
                ["II.", "What Perishable Knowledge Is"],
                ["III.", "Sourcing: Where It Hides"],
                ["IV.", "Pricing: The Half-Life Problem"],
                ["V.", "Building a Practice"],
                ["VI.", "A Field Guide for Founders"],
                ["VII.", "A Field Guide for Investors"],
                ["VIII.", "Teaching It"]
              ].map(([n, t], i) => (
                <div key={i} style={{
                  display:"grid", gridTemplateColumns:"60px 1fr", gap: 20,
                  padding: "18px 0", borderTop: i === 0 ? "1px solid var(--rule)" : "none",
                  borderBottom: "1px solid var(--rule)"
                }}>
                  <div className="mono" style={{color:"var(--accent-ink)", fontSize: 12, letterSpacing:"0.1em"}}>{n}</div>
                  <div className="h-md">{t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Endorsements placeholder */}
      <section className="section">
        <div className="container">
          <div className="eyebrow" style={{marginBottom: 16}}>Endorsements</div>
          <h2 className="h-lg" style={{marginBottom: 36}}>Early readers.</h2>
          <div className="grid-3">
            {[1,2,3].map((i) => (
              <div key={i} className="press-card">
                <div className="quote" style={{fontSize: 19}}>
                  Endorsement to come.
                </div>
                <div style={{marginTop: 18, display:"flex", gap: 10, alignItems:"center"}}>
                  <div style={{width: 28, height: 1, background:"var(--ink-4)"}} />
                  <div className="small">— forthcoming</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Author note */}
      <section className="section" style={{background: "var(--bg-2)"}}>
        <div className="container-read">
          <div className="eyebrow" style={{marginBottom: 16}}>Why I'm Writing This</div>
          <h2 className="h-lg" style={{marginBottom: 24}}>A short note from the author.</h2>
          <div className="stack-md">
            <p className="body" style={{fontSize: 17}}>
              I have spent the last decade on both sides of the table — first building companies, then picking them. In that time, one pattern kept showing up in the founders who outperformed the rest. It wasn't grit, or taste, or any of the usual explanations. It was how they handled information that was about to stop being true.
            </p>
            <p className="body" style={{fontSize: 17}}>
              I started writing <em>Perishable Knowledge</em> as a newsletter because I wanted to think out loud about what that looked like. The book is what happens when you follow a good question for four years and discover it is bigger than you thought.
            </p>
            <p className="body" style={{fontSize: 17, fontStyle:"italic", color:"var(--ink-3)"}}>
              — Collin
            </p>
          </div>
        </div>
      </section>

      <section className="subscribe-hero">
        <div className="container" style={{position:"relative", zIndex:1}}>
          <div style={{maxWidth: 720}}>
            <h2>Be the first to read it.</h2>
            <p>Waitlist subscribers get early chapters and a month's notice before publication.</p>
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
