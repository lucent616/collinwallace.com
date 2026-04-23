// App: router + shell
const { useState: useStateApp, useEffect: useEffectApp } = React;

function parseRoute() {
  const h = (window.location.hash || "").replace(/^#\/?/, "");
  const key = (h.split(/[?#]/)[0] || "home").toLowerCase();
  const valid = ["home","writing","book","speaking","about","contact"];
  return valid.includes(key) ? key : "home";
}

function App() {
  const [route, setRoute] = useStateApp(parseRoute());
  const [tweaks, setTweaks] = useStateApp(window.__TWEAKS);
  const [floatVisible, setFloatVisible] = useStateApp(false);

  useEffectApp(() => {
    const onHash = () => {
      setRoute(parseRoute());
      window.scrollTo({top: 0, behavior: "instant"});
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffectApp(() => {
    // apply tweak attrs to root
    const root = document.documentElement;
    root.setAttribute("data-accent", tweaks.accent);
    root.setAttribute("data-serif", tweaks.serif);
    root.setAttribute("data-warmth", tweaks.warmth);
    root.setAttribute("data-rhythm", tweaks.rhythm);

    // lazy-load extra fonts if needed
    const need = {
      fraunces: "Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400",
      crimson: "Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;1,400",
      lora: "Lora:ital,wght@0,400;0,500;0,600;1,400"
    }[tweaks.serif];
    if (need && !document.getElementById("font-extra-" + tweaks.serif)) {
      const link = document.createElement("link");
      link.id = "font-extra-" + tweaks.serif;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=" + need + "&display=swap";
      document.head.appendChild(link);
    }
  }, [tweaks]);

  useEffectApp(() => {
    const onScroll = () => setFloatVisible(window.scrollY > 700);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (key) => {
    window.location.hash = "#/" + key;
  };

  const Page = {
    home: HomePage,
    writing: WritingPage,
    book: BookPage,
    speaking: SpeakingPage,
    about: AboutPage,
    contact: ContactPage
  }[route] || HomePage;

  return (
    <div>
      <Header route={route} go={go} />
      <main>
        <Page go={go} tweaks={tweaks} />
      </main>
      <Footer go={go} />
      <FloatingSubscribe visible={floatVisible && route !== "contact"} onClick={() => {
        go("home");
        setTimeout(()=>{
          const el = document.getElementById("subscribe-footer");
          if (el) el.scrollIntoView({behavior:"smooth"});
        }, 50);
      }} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
