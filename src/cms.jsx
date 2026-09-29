// CMS helpers — fetch data/site/*.json with a hardcoded fallback,
// and render basic markdown emphasis without an external library.
const { useState: useStateCms, useEffect: useEffectCms } = React;

// Cache fetched JSON across components so flipping pages doesn't refetch.
window.__CMS_CACHE = window.__CMS_CACHE || {};

function useCmsData(path, fallback) {
  const [data, setData] = useStateCms(window.__CMS_CACHE[path] || fallback);
  useEffectCms(() => {
    if (window.__CMS_CACHE[path]) {
      setData(window.__CMS_CACHE[path]);
      return;
    }
    let cancelled = false;
    fetch(path, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json) return;
        window.__CMS_CACHE[path] = json;
        setData(json);
      })
      .catch(() => { /* keep fallback */ });
    return () => { cancelled = true; };
  }, [path]);
  return data;
}

// Tiny markdown emphasis renderer — handles **bold**, _italic_, *italic*.
// Returns an array of React children (strings + <strong>/<em> elements).
// Safe-by-construction: no dangerouslySetInnerHTML.
function renderMd(text) {
  if (text == null) return null;
  const tokens = [];
  const re = /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_)/g;
  let lastIndex = 0;
  let key = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) tokens.push(text.slice(lastIndex, m.index));
    if (m[2] != null) tokens.push(<strong key={key++}>{m[2]}</strong>);
    else if (m[3] != null) tokens.push(<strong key={key++}>{m[3]}</strong>);
    else if (m[4] != null) tokens.push(<em key={key++}>{m[4]}</em>);
    else if (m[5] != null) tokens.push(<em key={key++}>{m[5]}</em>);
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) tokens.push(text.slice(lastIndex));
  return tokens;
}

// Wrap renderMd inside a span (or any element via `as`).
function Md({ children, as: As = "span" }) {
  return <As>{renderMd(children)}</As>;
}

Object.assign(window, { useCmsData, renderMd, Md });
