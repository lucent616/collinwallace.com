#!/usr/bin/env python3
"""Fetch the Substack RSS feed and emit data/essays.json.

Usage: python3 scripts/sync_substack.py [--feed URL] [--out PATH]

Defaults: fetches https://collinwallace.substack.com/feed,
writes data/essays.json (one JSON array, one object per post).

Output fields per post:
  title, date (human "Apr 16, 2026"), date_iso, url, excerpt,
  read_time (e.g. "6 min"), tags (list of category strings).

Stdlib only — no pip install needed so the GitHub Action is fast.
"""
from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime

DEFAULT_FEED = "https://collinwallace.substack.com/feed"
DEFAULT_OUT = "data/essays.json"

# Substack sits behind Cloudflare which rejects anything that looks like a
# scripted client. Use a plausible browser UA (no "bot"/"sync"/"python" tokens)
# and a full set of Accept-* headers. Rotate through a few UAs on retry.
USER_AGENTS = [
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.3 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
]

NS = {
    "content": "http://purl.org/rss/1.0/modules/content/",
    "dc": "http://purl.org/dc/elements/1.1/",
}

# Rough words-per-minute for read-time estimates.
WPM = 220


def _request(url: str, ua: str, accept: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": ua,
            "Accept": accept,
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "identity",  # skip gzip so we can read raw bytes
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def fetch_with_retry(url: str, accept: str) -> bytes:
    last_exc = None
    for attempt, ua in enumerate(USER_AGENTS):
        try:
            return _request(url, ua, accept)
        except urllib.error.HTTPError as e:
            last_exc = e
            # 429 / 5xx are worth retrying; 403 sometimes clears on a retry too.
            if e.code in (403, 429, 500, 502, 503, 504):
                time.sleep(2 + attempt * 3)
                continue
            raise
        except Exception as e:
            last_exc = e
            time.sleep(2 + attempt * 3)
    assert last_exc is not None
    raise last_exc


# Public CORS proxies that have worked for this feed. Tried in order.
# Cloudflare blocks GitHub Actions' IP range from hitting Substack directly,
# so these are the primary route when running on CI.
PROXY_TEMPLATES = [
    "https://cors.eu.org/{url}",
    "https://api.codetabs.com/v1/proxy?quest={url}",
]


def fetch_via_proxy(url: str, accept: str) -> bytes:
    last_exc: Exception | None = None
    for template in PROXY_TEMPLATES:
        proxied = template.format(url=url)
        try:
            # Proxies don't need the full bot-evasion header set; keep it simple.
            req = urllib.request.Request(
                proxied,
                headers={"User-Agent": USER_AGENTS[0], "Accept": accept},
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = resp.read()
                if not data:
                    raise RuntimeError("empty response")
                return data
        except Exception as e:
            last_exc = e
            print(f"  proxy {template.split('/')[2]} failed: {e}", file=sys.stderr)
            continue
    assert last_exc is not None
    raise last_exc


def strip_html(s: str) -> str:
    # Remove tags, collapse whitespace, decode entities.
    s = re.sub(r"<[^>]+>", " ", s or "")
    s = html.unescape(s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def first_sentences(text: str, max_chars: int = 280) -> str:
    text = text.strip()
    if len(text) <= max_chars:
        return text
    cut = text[:max_chars]
    # Prefer ending at the last sentence boundary we found before the limit.
    m = re.search(r"[.!?](?=[^.!?]*$)", cut)
    if m and m.end() > max_chars * 0.5:
        return cut[: m.end()].strip()
    # Otherwise cut on the last space and add an ellipsis.
    space = cut.rfind(" ")
    if space > 0:
        cut = cut[:space]
    return cut.rstrip(",;:") + "…"


def format_date(pub_date: str) -> tuple[str, str]:
    """Return (human_date, iso_date) — both empty on failure."""
    for fmt in ("%a, %d %b %Y %H:%M:%S %Z", "%a, %d %b %Y %H:%M:%S %z"):
        try:
            dt = datetime.strptime(pub_date, fmt)
            return dt.strftime("%b %-d, %Y"), dt.strftime("%Y-%m-%d")
        except ValueError:
            continue
    return pub_date, ""


def estimate_read_time(html_body: str) -> str:
    words = len(strip_html(html_body).split())
    minutes = max(1, round(words / WPM))
    return f"{minutes} min"


def posts_from_archive_json(base_url: str) -> list[dict]:
    """Fallback: Substack's public /api/v1/archive returns JSON and is usually
    less aggressively rate-limited than /feed.
    """
    base = base_url.rstrip("/").replace("/feed", "")
    url = f"{base}/api/v1/archive?sort=new&limit=50"
    raw = fetch_with_retry(url, "application/json")
    data = json.loads(raw.decode("utf-8"))

    posts: list[dict] = []
    for p in data:
        title = p.get("title") or ""
        slug = p.get("slug") or ""
        canon = p.get("canonical_url") or (f"{base}/p/{slug}" if slug else "")
        pub = p.get("post_date") or p.get("published_at") or ""
        # post_date is ISO-8601 like "2026-04-16T12:58:24.000Z"
        try:
            dt = datetime.fromisoformat(pub.replace("Z", "+00:00"))
            human_date = dt.strftime("%b %-d, %Y")
            iso_date = dt.strftime("%Y-%m-%d")
        except Exception:
            human_date, iso_date = pub, ""

        # Archive items don't carry full body, but they have description / subtitle.
        excerpt_src = p.get("description") or p.get("subtitle") or ""
        excerpt = first_sentences(strip_html(excerpt_src))
        wordcount = p.get("wordcount") or 0
        if wordcount:
            read_time = f"{max(1, round(wordcount / WPM))} min"
        else:
            read_time = estimate_read_time(excerpt_src) if excerpt_src else ""

        posts.append({
            "title": html.unescape(title),
            "date": human_date,
            "date_iso": iso_date,
            "url": canon,
            "excerpt": excerpt,
            "read_time": read_time,
            "tags": [],
        })

    posts.sort(key=lambda p: p["date_iso"] or "", reverse=True)
    return posts


def parse_feed(xml_bytes: bytes) -> list[dict]:
    root = ET.fromstring(xml_bytes)
    channel = root.find("channel")
    if channel is None:
        raise RuntimeError("RSS feed has no <channel>")

    posts: list[dict] = []
    for item in channel.findall("item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        pub_date = (item.findtext("pubDate") or "").strip()
        description = item.findtext("description") or ""
        content_encoded = item.findtext("content:encoded", namespaces=NS) or ""

        # Skip podcasts / Substack Notes — keep essays only.
        if "/note/" in link or item.find("enclosure[@type='audio/mpeg']") is not None:
            # If you later decide to include podcasts, remove this guard.
            pass  # Let them through for now; they'll still render fine.

        human_date, iso_date = format_date(pub_date)
        excerpt = first_sentences(strip_html(description))
        body_for_timing = content_encoded or description
        read_time = estimate_read_time(body_for_timing)

        tags: list[str] = []
        for cat in item.findall("category"):
            t = (cat.text or "").strip()
            if t:
                tags.append(t.lower())

        posts.append(
            {
                "title": html.unescape(title),
                "date": human_date,
                "date_iso": iso_date,
                "url": link,
                "excerpt": excerpt,
                "read_time": read_time,
                "tags": tags,
            }
        )

    # Most recent first (Substack already does this, but be explicit).
    posts.sort(key=lambda p: p["date_iso"] or "", reverse=True)
    return posts


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--feed", default=DEFAULT_FEED)
    ap.add_argument("--out", default=DEFAULT_OUT)
    args = ap.parse_args()

    # Strategy cascade — Substack is fronted by Cloudflare and aggressively blocks
    # scripted clients from CI IP ranges (Azure / GitHub Actions). In order:
    #   1. Direct fetch of /feed with browser-looking headers (works locally).
    #   2. Direct fetch of /api/v1/archive (JSON, sometimes less blocked).
    #   3. Public CORS proxy chain (cors.eu.org, codetabs) as a last resort.
    posts: list[dict] = []
    source_used = args.feed
    accept_rss = "application/rss+xml,application/xml,text/xml,*/*;q=0.8"

    strategies = [
        ("direct RSS",
         lambda: parse_feed(fetch_with_retry(args.feed, accept_rss))),
        ("direct archive JSON",
         lambda: posts_from_archive_json(args.feed)),
        ("proxied RSS",
         lambda: parse_feed(fetch_via_proxy(args.feed, accept_rss))),
    ]

    last_err: Exception | None = None
    for label, run in strategies:
        try:
            print(f"trying: {label}…", file=sys.stderr)
            posts = run()
            if not posts:
                raise RuntimeError("strategy returned 0 posts")
            source_used = f"{args.feed} (via {label})"
            print(f"  → {label} got {len(posts)} posts", file=sys.stderr)
            break
        except Exception as e:
            last_err = e
            print(f"  → {label} failed: {e}", file=sys.stderr)
    else:
        raise RuntimeError(f"all fetch strategies failed; last: {last_err}")

    payload = {
        "source": source_used,
        "fetched_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "count": len(posts),
        "posts": posts,
    }

    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"wrote {len(posts)} posts to {args.out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
