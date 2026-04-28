# Four Fingers News — editing contract

This repo backs **fourfingersnews.com** (GitHub Pages, branch `main`, root `/`).
The site is a **multi-page** static dispatch. Read this before editing.

---

## File layout

| File | What it is |
|------|------------|
| `index.html` | **Landing page only** — chyron, From the Editor, header, The Run Down, multi-page nav, card grid linking to each section page, footer. Does NOT contain section content. |
| `iran.html` | Iran War banner + Iran War Cost Tracker. |
| `lebanon.html` | Lebanon · Israel Track. |
| `troops.html` | Track the Troops (OSINT sitrep) + live news / world map. |
| `politics.html` | Trump greatest hits, Latest Truths, Objectives, Ballroom Tracker, War Duration, Strategic Resource Map. |
| `markets.html` | Market sentiment, Energy Monitor, National Gas Prices, Stock Ticker. |
| `ai.html` | AI & The Machine. |
| `quantum.html` | Quantum / Computing & Physics. |
| `rapture.html` | Rapture / Eschatology. |
| `sports.html` | Seattle teams + Live Scoreboards + NFL Draft. |
| `epstein.html` | Epstein Files Corner. |
| `assets/style.css` | Shared stylesheet. All section CSS lives here. |
| `assets/app.js` | Shared engine — clock, stocks, sports, Iran data, world cards, gas prices, etc. |
| `_notes/` | Private editorial notes. Not published. |

---

## Hard rules for any edit (manual or automated)

### 1. Never re-monolithize `index.html`

If you find yourself adding the Iran War banner, Lebanon Track, Strategic
Resource Map, AI section, Sports cards, Epstein corner, or any other
section content into `index.html` — **stop**. Edit it on the section page.

`index.html` should stay roughly **40–80 KB**. If it balloons past 100 KB
something has gone wrong and you are about to wipe out the multi-page split.
Check `git log -p index.html | head` before pushing.

### 2. Edit on the right page

Each section's content lives on exactly **one** page. The section ID is the
addressing system:

| Element ID | Lives on |
|------------|----------|
| `#runDownList`, `#runDownUpdated` | `index.html` |
| `#editorNoteDate`, `.editor-note .en-text` | `index.html` |
| `#iranWarBanner`, `#iranDayCount`, `#iranDuration` | `iran.html` |
| `#lebanonTrack`, `#lt-bullets`, `#lt-stats`, `#lt-updated` | `lebanon.html` |
| `#trackTroops`, `#trackTroopsRows`, `#trackTroopsNotes`, `#trackTroopsUpdated` | `troops.html` |
| `#trumpQuote`, `#truthFeedList`, `#objectives*`, ballroom, war duration, resource map | `politics.html` |
| `#fgGauge`, `#tickerSP`/`NDX`/`VIX`/`BTC`/`Gold`, `#wtiPrice`, `#brentPrice`, `#natlGas*` | `markets.html` |
| `#aiLabRows`, `#aiIntlRows`, `#aiCapexCards`, `#aiReleasesFeed`, `#aiNarrative`, `#aiUpdated` | `ai.html` |
| `#quantumScoreboard`, `#quantumRace`, `#qdayClock`, `#quantumWire`, `#quantumNet` | `quantum.html` |
| `#raptureIndex`, `#raptureHotCats`, `#prophecyChecklist`, `#scriptureWire`, `#pewGap` | `rapture.html` |
| `#seahawksRecord`/`Next`/`Detail`, `#mariners*`, `#kraken*`, `#uw*`, scoreboards | `sports.html` |
| `#epsteinDays`, named names, conspiracy board | `epstein.html` |

### 3. Cross-page edits go to **all** pages that share the element

Some chrome is duplicated (chyron ticker, header nameplate, section nav,
footer). When you change those, edit **every** HTML file. The chyron in
particular should be byte-identical across all 11 pages.

When updating the chyron, use:

```bash
ls *.html | xargs -I{} sed -i '' 's/old chyron text/new chyron text/g' {}
```

…or scripted equivalent. Don't update only `index.html`.

### 4. Pull before editing

If you have a local checkout, **`git pull --rebase` first**. Background
scheduled tasks commit hourly; pushing stale work blows them away. The
`Trevor (scheduled) <scheduled@fourfingersnews.com>` author is the
content-refresh bot — those commits are correct, do not revert them.

### 5. Never inline a `<style>` block back into a page

All styles live in `assets/style.css`. If you need a new style, add it
there with a `/* === sectionName === */` comment header. Inline styles on
attributes are fine; new `<style>` blocks are not.

### 6. Never inline a new `<script>` block back into a page

All page-load JavaScript lives in `assets/app.js`. The only exceptions
already in place:
- `<script>` inside the header that rotates the FFN tagline (per-page)
- `<script>` inside From the Editor that auto-fills the date (landing only)
- `<script>` inside live scoreboards section on `sports.html`

Don't add new ones. Add to `assets/app.js` instead, and use defensive null
checks (`var el = document.getElementById('foo'); if (!el) return;`) so
the shared script works on every page.

---

## Common task → page mapping

| Refresh task | Pages it should touch |
|--------------|----------------------|
| Chyron/headlines refresh | **all 11 HTML files** (chyron is duplicated) |
| The Run Down (daily 7am) | `index.html` only |
| From the Editor | `index.html` only |
| Iran War banner refresh | `iran.html` (and chyron items on all pages if Day count changes) |
| Lebanon Track refresh | `lebanon.html` |
| Track the Troops refresh | `troops.html` |
| AI beat | `ai.html` |
| Quantum tracker refresh | `quantum.html` |
| Rapture tracker refresh | `rapture.html` |
| Markets / gas prices | live JS, no HTML edit needed; static fallbacks on `markets.html` |
| Sports live scoreboards | live JS, no HTML edit needed |
| Epstein day counter | live JS, no HTML edit needed |
| Footer visit counter / cache headers / global cosmetic | **all 11 HTML files** |

---

## Sanity check before any push

### Structure check

```bash
wc -l *.html        # index.html should be < 600 lines
ls -la index.html   # < 80 KB
grep -c 'href="iran.html"' index.html   # should be ≥ 2 (nav + card)
grep -c 'landing-grid' index.html       # should be 1
grep -c 'iranWarBanner' index.html      # should be 0
grep -c 'lebanonTrack' index.html       # should be 0
```

If `index.html` grew past 100 KB or contains `iranWarBanner`/`lebanonTrack`,
you've re-monolithized it. Fix before pushing.

### Freshness check

`tools/freshness-check.py` flags stale countdowns, day counts, and
"Updated:" labels that have drifted past today. Run locally before pushing
content edits:

```bash
python3 tools/freshness-check.py             # against local files
python3 tools/freshness-check.py --live      # against fourfingersnews.com
```

Exit code is the number of errors (0 = clean). The same script runs daily
in CI via `.github/workflows/freshness.yml`; if it finds anything, it
opens (or updates) a `freshness` GitHub issue with the report.

The script knows about: Iran day counter (war started 2026-02-28),
"X days to <date>" countdowns (numeric or word — "six days to May 1"),
past-event countdowns, and `Updated: <Day> <Mon> <DayNum>` labels older
than the configured limit. Add new rules in `check_*` functions when a
new staleness pattern shows up.
