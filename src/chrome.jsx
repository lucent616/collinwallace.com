// Header + Footer chrome
const { useState: useStateChrome, useEffect: useEffectChrome } = React;

function Header({ route, go }) {
  const [open, setOpen] = useStateChrome(false);
  const [scrolled, setScrolled] = useStateChrome(false);
  useEffectChrome(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const nav = [
    { key: "writing", label: "Writing" },
    { key: "book", label: "Book" },
    { key: "speaking", label: "Speaking" },
    { key: "about", label: "About" },
    { key: "contact", label: "Contact" }
  ];
  const link = (k, label) => (
    <a
      key={k}
      href={"#/" + k}
      className={route === k ? "active" : ""}
      onClick={(e) => { e.preventDefault(); go(k); setOpen(false); }}
    >{label}</a>
  );
  return (
    <header className="header" style={scrolled ? {borderBottomColor: "var(--rule-2)"} : {}}>
      <div className="container header-inner">
        <a href="#/home" className="wordmark" onClick={(e) => { e.preventDefault(); go("home"); }}>
          <span className="dot" />
          Collin Wallace
        </a>
        <nav className={"nav" + (open ? " open" : "")}>
          {nav.map((n) => link(n.key, n.label))}
        </nav>
        <div style={{display:"flex", alignItems:"center", gap: 12}}>
          <a href="#/home#subscribe" className="subscribe-chip hide-mobile" onClick={(e) => {
            e.preventDefault();
            go("home");
            setTimeout(() => {
              const el = document.getElementById("subscribe-footer");
              if (el) el.scrollIntoView({behavior:"smooth", block:"start"});
            }, 50);
          }}>
            Subscribe <Arrow />
          </a>
          <button className="hamburger" onClick={() => setOpen(!open)} aria-label="menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer({ go }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a href="#/home" className="wordmark" onClick={(e) => { e.preventDefault(); go("home"); }}>
              <span className="dot" />
              Collin Wallace
            </a>
            <p className="small" style={{marginTop: 14, maxWidth: 340}}>
              Writer, investor, entrepreneur. Lecturer at Stanford University. General Partner at Lobby Capital.
            </p>
          </div>
          <div>
            <h4>Site</h4>
            <a href="#/writing" onClick={(e)=>{e.preventDefault();go("writing");}}>Writing</a>
            <a href="#/book" onClick={(e)=>{e.preventDefault();go("book");}}>Book</a>
            <a href="#/speaking" onClick={(e)=>{e.preventDefault();go("speaking");}}>Speaking</a>
            <a href="#/about" onClick={(e)=>{e.preventDefault();go("about");}}>About</a>
            <a href="#/contact" onClick={(e)=>{e.preventDefault();go("contact");}}>Contact</a>
          </div>
          <div>
            <h4>Elsewhere</h4>
            <a href="https://perishableknowledge.substack.com" target="_blank" rel="noopener">Substack</a>
            <a href="#" onClick={(e)=>e.preventDefault()}>Twitter / X</a>
            <a href="#" onClick={(e)=>e.preventDefault()}>LinkedIn</a>
            <a href="#" onClick={(e)=>e.preventDefault()}>RSS</a>
          </div>
          <div>
            <h4>Contact</h4>
            <a href="mailto:collin@lifemademobile.com">collin@lifemademobile.com</a>
            <a href="#/contact" onClick={(e)=>{e.preventDefault();go("contact");}}>Speaking inquiries</a>
            <p className="tiny" style={{marginTop: 10, maxWidth: 240}}>
              If you're raising, please reach out via <a href="#" onClick={(e)=>e.preventDefault()} style={{padding:0, display:"inline", borderBottom:"1px solid var(--rule-2)"}}>Lobby Capital</a>.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 WALLACE INDUSTRIES LLC.</div>
          <div>BUILT WITH INTENTION</div>
        </div>
      </div>
    </footer>
  );
}

function FloatingSubscribe({ visible, onClick }) {
  return (
    <button className={"float-sub" + (visible ? " visible" : "")} onClick={onClick}>
      Subscribe to Perishable Knowledge →
    </button>
  );
}

Object.assign(window, { Header, Footer, FloatingSubscribe });
