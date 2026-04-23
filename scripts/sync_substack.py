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
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime

DEFAULT_FEED = "https://collinwallace.substack.com/feed"
DEFAULT_OUT = "data/essays.json"
USER_AGENT = "Mozilla/5.0 (collinwallace.com site sync)"

NS = {
    "content": "http://purl.org/rss/1.0/modules/content/",
    "dc": "http://purl.org/dc/elements/1.1/",
}

# Rough words-per-minute for read-time estimates.
WPM = 220


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


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

    xml_bytes = fetch(args.feed)
    posts = parse_feed(xml_bytes)

    payload = {
        "source": args.feed,
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
