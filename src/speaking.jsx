// /speaking page
const { useState: useStateSpeak } = React;

function SpeakingPage({ go }) {
  const venues = useCmsData("data/site/venues.json", { items: window.DATA.venues });
  const talks = useCmsData("data/site/talks.json", { items: window.DATA.talks });
  const testimonials = useCmsData("data/site/testimonials.json", { items: window.DATA.testimonials });

  const [form, setForm] = useStateSpeak({
    name: "", email: "", org: "", event: "", date: "", size: "", topic: "", message: ""
  });
  const [sent, setSent] = useStateSpeak(false);
  const update = (k) => (e) => setForm({...form, [k]: e.target.value});
  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
  };

  return (
    <div>
      <section className="section" style={{paddingBottom: "calc(56px * var(--rhythm))"}}>
        <div className="container">
          <div className="grid-hero">
            <div>
              <div className="eyebrow" style={{marginBottom: 16}}>Speaking</div>
              <h1 className="h-xl">Book Collin to speak at your event.</h1>
              <p className="lede" style={{marginTop: 22, maxWidth: 560}}>
                Keynotes, workshops, and founder sessions on knowledge arbitrage, AI-era investing, and the skills that survive automation. Delivered with the same plainspoken clarity as the newsletter.
              </p>
              <div style={{marginTop: 28, display:"flex", gap: 12, flexWrap:"wrap"}}>
                <a href="#inquiry" className="btn btn-primary" onClick={(e)=>{e.preventDefault();document.getElementById("inquiry").scrollIntoView({behavior:"smooth"});}}>Send an inquiry <Arrow /></a>
                <a href="#talks" className="btn btn-ghost" onClick={(e)=>{e.preventDefault();document.getElementById("talks").scrollIntoView({behavior:"smooth"});}}>See signature talks</a>
              </div>
            </div>
            <div style={{width:"100%", maxWidth: 460, marginLeft:"auto"}}>
              <Headshot src="podium" label="" objectPosition="center 20%" />
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm" style={{background:"var(--bg-2)", borderTop:"1px solid var(--rule)", borderBottom:"1px solid var(--rule)"}}>
        <div className="container">
          <div className="eyebrow" style={{marginBottom: 28, textAlign:"center"}}>Past venues</div>
          <LogoStrip items={venues.items || []} />
        </div>
      </section>

      <section id="talks" className="section">
        <div className="container">
          <SectionHead eyebrow="Signature Talks" title="Five talks, refined over fifty rooms." />
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap: 20}}>
            {(talks.items || []).map((t, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="talk-card">
                  <div className="talk-number">TALK · {t.number}</div>
                  <h3 className="talk-title">{t.title}</h3>
                  <p className="talk-abstract">{t.abstract}</p>
                  <div className="talk-audience">For: {t.audience}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{background:"var(--bg-2)", borderTop:"1px solid var(--rule)"}}>
        <div className="container">
          <div className="eyebrow" style={{marginBottom: 28}}>What hosts say</div>
          <div className="grid-3">
            {(testimonials.items || []).map((t, i) => (
              <div key={i}>
                <div className="quote" style={{fontSize: 20, lineHeight: 1.4}}>{t.quote}</div>
                <div style={{marginTop: 20, display:"flex", gap: 10, alignItems:"center"}}>
                  <div style={{width: 28, height: 1, background:"var(--ink-4)"}} />
                  <div className="small"><strong style={{color:"var(--ink-2)"}}>{t.person}</strong> · {t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="inquiry" className="section">
        <div className="container-read">
          <div className="eyebrow" style={{marginBottom: 16}}>Inquiry</div>
          <h2 className="h-lg" style={{marginBottom: 10}}>Tell me about your event.</h2>
          <p className="body" style={{marginBottom: 32, maxWidth: 560}}>
            I read every inquiry personally. Replies usually take 2–3 business days.
          </p>
          {sent ? (
            <div className="capture-success" style={{fontSize: 18}}>
              <span style={{fontSize:22}}>✓</span>
              <span>Thanks — message received. I'll be in touch within a few business days.</span>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="field-row">
                <div className="field"><label>Your name</label><input value={form.name} onChange={update("name")} required /></div>
                <div className="field"><label>Email</label><input type="email" value={form.email} onChange={update("email")} required /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Organization</label><input value={form.org} onChange={update("org")} /></div>
                <div className="field"><label>Event name</label><input value={form.event} onChange={update("event")} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Event date</label><input type="date" value={form.date} onChange={update("date")} /></div>
                <div className="field"><label>Audience size</label>
                  <select value={form.size} onChange={update("size")}>
                    <option value="">Select…</option>
                    <option>Under 50</option><option>50–200</option><option>200–1,000</option><option>1,000+</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Topic interest</label>
                <select value={form.topic} onChange={update("topic")}>
                  <option value="">Select a talk…</option>
                  {(talks.items || []).map((t) => <option key={t.number}>{t.title}</option>)}
                  <option>Other / custom</option>
                </select>
              </div>
              <div className="field">
                <label>Message</label>
                <textarea value={form.message} onChange={update("message")} required placeholder="Anything else I should know about your audience, format, or goals." />
              </div>
              <button type="submit" className="btn btn-primary">Send inquiry <Arrow /></button>
              <p className="tiny" style={{marginTop: 16}}>Submissions route to collin@lifemademobile.com</p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { SpeakingPage });
