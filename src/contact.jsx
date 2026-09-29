// /contact page — intent-adaptive form
const { useState: useStateContact } = React;

function ContactPage({ go }) {
  const [intent, setIntent] = useStateContact("hi");
  const [form, setForm] = useStateContact({name:"", email:"", org:"", date:"", size:"", outlet:"", deadline:"", message:""});
  const [sent, setSent] = useStateContact(false);
  const update = (k) => (e) => setForm({...form, [k]: e.target.value});
  const submit = (e) => { e.preventDefault(); if (!form.name || !form.email || !form.message) return; setSent(true); };

  const intents = [
    {v:"speaking", label:"Speaking"},
    {v:"press",    label:"Press"},
    {v:"media",    label:"Media"},
    {v:"newsletter",label:"Newsletter question"},
    {v:"hi",       label:"Say hi"}
  ];

  return (
    <div>
      <section className="section">
        <div className="container-read">
          <div className="eyebrow" style={{marginBottom: 16}}>Contact</div>
          <h1 className="h-xl">Get in touch.</h1>
          <p className="lede" style={{marginTop: 22}}>
            Pick an intent so I can route your message. I read every one.
          </p>

          <div style={{
            marginTop: 28, padding: 14,
            background: "var(--accent-soft)",
            borderLeft: "3px solid var(--accent)",
            borderRadius: 4,
            fontSize: 14, color: "var(--ink-2)"
          }}>
            <strong style={{color:"var(--ink)"}}>If you're raising,</strong> please reach out via Lobby Capital — this form isn't the right place.
          </div>

          {sent ? (
            <div className="capture-success" style={{marginTop: 32, fontSize: 18}}>
              <span style={{fontSize:22}}>✓</span>
              <span>Message received. I'll reply from collin@lifemademobile.com.</span>
            </div>
          ) : (
            <form onSubmit={submit} style={{marginTop: 36}}>
              <div className="field">
                <label>What is this about?</label>
                <select value={intent} onChange={(e)=>setIntent(e.target.value)}>
                  {intents.map((i)=> <option key={i.v} value={i.v}>{i.label}</option>)}
                </select>
              </div>

              <div className="field-row">
                <div className="field"><label>Name</label><input value={form.name} onChange={update("name")} required /></div>
                <div className="field"><label>Email</label><input type="email" value={form.email} onChange={update("email")} required /></div>
              </div>

              {intent === "speaking" && (
                <>
                  <div className="field-row">
                    <div className="field"><label>Organization</label><input value={form.org} onChange={update("org")} /></div>
                    <div className="field"><label>Event date</label><input type="date" value={form.date} onChange={update("date")} /></div>
                  </div>
                  <div className="field">
                    <label>Audience size</label>
                    <select value={form.size} onChange={update("size")}>
                      <option value="">Select…</option>
                      <option>Under 50</option><option>50–200</option><option>200–1,000</option><option>1,000+</option>
                    </select>
                  </div>
                </>
              )}

              {(intent === "press" || intent === "media") && (
                <div className="field-row">
                  <div className="field"><label>Outlet</label><input value={form.outlet} onChange={update("outlet")} /></div>
                  <div className="field"><label>Deadline</label><input type="date" value={form.deadline} onChange={update("deadline")} /></div>
                </div>
              )}

              <div className="field">
                <label>Message</label>
                <textarea
                  value={form.message}
                  onChange={update("message")}
                  required
                  placeholder={{
                    speaking: "Tell me about your audience, format, and what you're hoping to achieve.",
                    press:    "What's the story, and how can I help?",
                    media:    "What are you working on, and what do you need from me?",
                    newsletter:"Which essay, and what's the question?",
                    hi:       "Say whatever you'd like."
                  }[intent]}
                />
              </div>

              <button type="submit" className="btn btn-primary">Send message <Arrow /></button>
              <p className="tiny" style={{marginTop: 16}}>
                Or email directly: <a href="mailto:collin@lifemademobile.com" style={{color:"var(--accent-ink)", borderBottom:"1px solid var(--rule-2)"}}>collin@lifemademobile.com</a>
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { ContactPage });
