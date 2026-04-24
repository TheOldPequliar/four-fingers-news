# War Canon — Iran-US War Coverage

*Operational reference for the Iran desk and any other session writing copy about the war. One source of truth for dates, names, and running counts. If the site and this file disagree, canon wins — fix the site, or update this file if the underlying fact has moved.*

---

## Start dates (don't drift)

**Feb 28, 2026 — Day 1 of the war.**

- US + Israel launched strikes on Iran; Khamenei killed.
- WPR 60-day notification filed the same day; clock hits **May 1**.
- Operation name: **Epic Fury** (use sparingly in dispatch copy — the reader doesn't need the op name in a headline).

**Day-count formula (matches the JS in `index.html`):**

```
floor((now - Feb 28 2026 00:00) / 86400000) + 1 = current war day
```

Inclusive count. Feb 28 = Day 1. 2026 is not a leap year (Feb has 28 days).

| Date | War Day |
|---|---|
| Feb 28 | 1 |
| Apr 13 (blockade begins) | 45 |
| Apr 23 (Thu; Lebanon extension signed) | 55 |
| Apr 24 (today) | 56 |
| May 1 (WPR deadline) | 63 |
| May 17 (Lebanon extension expiry) | 79 |

## Running timelines

- **Feb 28** — War begins.
- **Mar 30** — Hormuz Management Plan announced (toll regime).
- **Apr 13** — Hormuz blockade begins; US interdiction ops start.
- **Apr 23** — Three-week Israel–Lebanon ceasefire extension signed in Washington (Moawad / Leiter under Rubio / Needham). First toll revenue received same day.
- **May 1** — WPR 60-day clock expires.
- **May 17** — Current Lebanon ceasefire expiry.

## Names (spelling matters)

### Iran

- **Ali Khamenei** (dec.) — former Supreme Leader.
- **Mojtaba Khamenei** — installed successor. Not on camera since taking the seat.
- **Masoud Pezeshkian** — president (civilian side).
- **Abbas Araghchi** — foreign minister. Lead negotiator.
- **Mohammad Bagher Ghalibaf** — Majles speaker. Reportedly off the negotiating team per Israel's N12; Tehran unconfirmed.
- **Gen Ahmad Vahidi** — IRGC commander.
- **Mahdi Mohammadi** — Ghalibaf adviser ("Trump extension means nothing" line).

### US

- **Trump** — president.
- **JD Vance** — VP (off Islamabad delegation, on standby).
- **Steve Witkoff, Jared Kushner** — lead negotiators.
- **Marco Rubio** — SecState.
- **Pete Hegseth** — SecDef ("as long as it takes").
- **Karoline Leavitt** — WH press.
- **Needham** — State Department, ran Lebanon–Israel ambassador session.

### Lebanon / Israel track

- **Moawad** — Lebanon's ambassador to the US.
- **Leiter** — Israel's ambassador to the US.
- **Netanyahu** — Israeli PM.
- **Naim Qassem** — Hezbollah secretary-general.

### Other actors

- **John Healey** — UK defense secretary.
- **Sébastien Vautrin** — France defense minister.
- **Macron–Starmer** — 51-nation Hormuz communiqué.
- **Chung Byung-ha** — South Korea's special envoy to Tehran.
- **Kyriakos Mitsotakis** — Greek PM (on record against the toll regime).

## Running counts (update when refreshed, flag last-reviewed date)

- **US KIA:** 13.
- **US WIA:** 373+.
- **Iran military dead (state media):** ~3,500.
- **Lebanon civil defense dead:** 2,454 (as of Wed Apr 22 release).
- **Lebanon wounded:** 7,658.
- **French UNIFIL KIA:** 2 (both paratroopers, Ghandouriyeh small-arms attack).
- **Vessels held:** US — Touska, Tifani, Majestic X. IRGC — Francesca, Epaminondas.

## Hormuz ledger

- Blockade begins: **Apr 13** (Day 45).
- IEA Mon tracker: **16 vessels through** vs ~60/day pre-war.
- **31 vessels redirected** since Apr 13.
- **~20,000 seafarers stranded** in the region (UN IMO).
- Toll regime: Mar 30 Hormuz Management Plan. First toll revenue received Thu Apr 23.
- Payment rails: yuan, BTC, USDT.

## Conventions (what we don't do)

- **Don't count from Feb 26 or Feb 27.** Canon is Feb 28. When the stat tile drifts from JS, correct to canon.
- **Don't make America the grammatical subject in every sentence.** See `editorial-posture.md` — symmetric motivations, vary the subject.
- **Don't forecast, don't prescribe.** Frames, not predictions.
- **Don't bloat the banner.** Headline under ~80 words; bullets 4–8, each under ~25 words. If the hourly refresh task pushes past those caps, trim back hard.

## Edit-target map

Element owners on the live page:

- **Iran War Banner:** `.iw-headline`, `.iw-bullets`, `#iranDayCount`, `.iran-day-count` — refreshed hourly by `daily-sitch-refresh`; correspondent trims when it bloats.
- **Iran War Live Counter JS:** `initIranCounter` in `index.html` script block — anchor is `new Date(2026, 1, 28)`. Don't change without updating this file.
- **Track the Troops:** `#trackTroopsUpdated`, `#trackTroopsRows`, `#trackTroopsNotes` — owned by `track-the-troops` scheduled task.
- **Lebanon · Israel Track:** `#lt-dek`, `#lt-bullets`, `#lt-stats`, `#lt-updated` — **manual correspondent only**; scheduled tasks keep out.
- **Iran War Costs:** `#iranTotalCost`, `#iranDailyBurn`, `#iranPerTaxpayer`, `#iranMunitions`, `#iranNaval`, `#iranAir`, `#iranCyber`, `#iranPersonnel` — correspondent re-peg, flag the Day on each refresh.
- **War Duration Comparison Table:** `war-compare-grid` — carved-out satirical vehicle; keeps its snark. See feedback note in `.auto-memory/feedback_ffn_war_duration_table.md`.

---

*Last reviewed: Fri Apr 24, 2026 (Day 56).*
