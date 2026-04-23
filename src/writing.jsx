// Writing page — essay index with tags + search
const { useState: useStateWriting, useMemo: useMemoWriting } = React;

function WritingPage({ go, tweaks }) {
  const [activeTag, setActiveTag] = useStateWriting("all");
  const [query, setQuery] = useStateWriting("");

  const filtered = useMemoWriting(() => {
    return window.DATA.essays.filter((e) => {
      const tagOk = activeTag === "all" || e.tags.includes(activeTag);
      const q = query.trim().toLowerCase();
      const qOk = !q || e.title.toLowerCase().includes(q) || e.excerpt.toLowerCase().includes(q);
      return tagOk && qOk;
    });
  }, [activeTag, query]);

  return (
    <div>
      <section className="section" style={{paddingBottom: "calc(32px * var(--rhythm))"}}>
        <div className="container">
          <div style={{maxWidth: 780}}>
            <div className="eyebrow" style={{marginBottom: 16}}>The Writing</div>
            <h1 className="h-xl">
              Notes on knowledge that won't keep.
            </h1>
            <p className="lede" style={{marginTop: 22, maxWidth: 620}}>
              A weekly essay on where founder edge lives, what AI actually changes about expertise, and how to build a practice around insights with short half-lives.
            </p>
          </div>
        </div>
      </section>

      {/* Subscribe strip */}
      <section style={{background: "var(--bg-2)", padding: "24px 0", borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)"}}>
        <div className="container" style={{display:"flex", gap: 24, alignItems:"center", justifyContent:"space-between", flexWrap:"wrap"}}>
          <div className="body" style={{margin: 0, maxWidth: 420, fontSize: 14.5}}>
            {tweaks.subscriberCount && <><strong style={{color:"var(--ink)"}}>12,400+ readers.</strong> </>}
            New essays every Saturday, delivered to your inbox.
          </div>
          <div style={{flex: "1 1 320px", maxWidth: 460}}>
            <EmailCapture cta="Subscribe" placeholder="Your email address" />
          </div>
        </div>
      </section>

      {/* Search + tags */}
      <section className="section-sm">
        <div className="container">
          <div style={{display:"grid", gridTemplateColumns: "minmax(0, 1fr) minmax(240px, 360px)", gap: 24, alignItems:"center", marginBottom: 28}}>
            <div style={{display:"flex", gap: 8, flexWrap:"wrap"}}>
              {window.DATA.tagList.map((t) => (
                <button
                  key={t}
                  className={"tag" + (activeTag === t ? " active" : "")}
                  onClick={() => setActiveTag(t)}
                >{t}</button>
              ))}
            </div>
            <div style={{position:"relative"}}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search essays…"
                style={{
                  width:"100%", padding:"12px 14px 12px 40px",
                  border:"1px solid var(--rule-2)", borderRadius: 4,
                  fontFamily:"var(--sans)", fontSize: 14.5,
                  background: "var(--paper)", outline: "none", color: "var(--ink)"
                }}
              />
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{position:"absolute", left: 14, top: "50%", transform:"translateY(-50%)", color: "var(--ink-3)"}}>
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <div style={{marginTop: 24}}>
            {filtered.length === 0 && (
              <div className="body" style={{padding: "60px 0", textAlign:"center"}}>
                No essays match that filter.
              </div>
            )}
            {filtered.map((e, i) => (
              <a key={i} className="essay-card" href="#" onClick={(ev)=>ev.preventDefault()}>
                <div className="essay-meta">
                  <span>{e.date}</span>
                  <span className="dot" />
                  <span>{e.readTime}</span>
                  <span className="dot" />
                  <span>{e.tags[0]}</span>
                </div>
                <h3 className="essay-title">{e.title}</h3>
                <p className="essay-excerpt">{e.excerpt}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="subscribe-hero">
        <div className="container" style={{position:"relative", zIndex:1}}>
          <div style={{maxWidth: 720}}>
            <h2>Don't miss the next one.</h2>
            <p>Saturday mornings. One essay. Always specific.</p>
            <div style={{maxWidth: 520}}>
              <EmailCapture cta="Subscribe" placeholder="Your email address" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { WritingPage });
