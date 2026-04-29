#!/usr/bin/env python3
"""Freshness lint for fourfingersnews.com.

Catches the kinds of stale content that drift when pages are refreshed
incompletely (one section updated, another forgotten):

    1. Iran day counter — "Day NN", `<span class="iran-day-count">NN`, etc.
       compared against (today - 2026-02-28 + 1).
    2. Countdown phrases — "6 days to May 1", "Six Days To May 1",
       "in N days until <date>" — verifies the math.
    3. "Updated:" labels — "Updated: Sat Apr 25" should be within ~2 days
       of today. The "Last refresh" footer should be within ~1 day.
    4. Past-event countdowns — flags "X days to <date>" where the date
       is already in the past.

Run from repo root:

    python3 tools/freshness-check.py             # local files
    python3 tools/freshness-check.py --live      # fetch from fourfingersnews.com
    python3 tools/freshness-check.py --date 2026-04-30   # pretend today is...

Exit code is the issue count (0 = clean, >0 = stale content found).
"""

from __future__ import annotations
import argparse
import datetime as dt
import re
import sys
import urllib.request
from pathlib import Path
from typing import Iterable

# ────── KNOWN DATES ──────
WAR_START = dt.date(2026, 2, 28)  # Operation Epic Fury begins → "Day 1"

PAGES = [
    'index.html', 'iran.html', 'lebanon.html', 'troops.html',
    'politics.html', 'markets.html', 'ai.html', 'quantum.html',
    'rapture.html', 'sports.html', 'epstein.html',
]

# ────── HELPERS ──────
WORD_TO_NUM = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
    'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18,
    'nineteen': 19, 'twenty': 20, 'thirty': 30,
}
MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
MONTH_TO_NUM = {m: i + 1 for i, m in enumerate(MONTHS_SHORT)}

# Color
RESET = '\033[0m' if sys.stdout.isatty() else ''
RED = '\033[31m' if sys.stdout.isatty() else ''
YELLOW = '\033[33m' if sys.stdout.isatty() else ''
DIM = '\033[2m' if sys.stdout.isatty() else ''
BOLD = '\033[1m' if sys.stdout.isatty() else ''


def iran_day_for(today: dt.date) -> int:
    return (today - WAR_START).days + 1


def parse_short_date(s: str, today: dt.date) -> dt.date | None:
    """Parse 'Sat Apr 25' or 'Apr 25' to a date."""
    m = re.match(r'(?:[A-Za-z]{3}\s+)?([A-Z][a-z]{2})\s+(\d{1,2})', s)
    if not m:
        return None
    mo, d = m.groups()
    if mo not in MONTH_TO_NUM:
        return None
    yr = today.year
    try:
        date = dt.date(yr, MONTH_TO_NUM[mo], int(d))
    except ValueError:
        return None
    # If the parsed date is more than 6 months in the future, it's last year.
    if date > today + dt.timedelta(days=180):
        date = dt.date(yr - 1, MONTH_TO_NUM[mo], int(d))
    return date


def parse_count(num_str: str | None, word: str | None) -> int | None:
    if num_str:
        try:
            return int(num_str)
        except ValueError:
            return None
    if word:
        return WORD_TO_NUM.get(word.lower())
    return None


# ────── ISSUE COLLECTOR ──────
class Issues:
    def __init__(self) -> None:
        self.errors: list[tuple] = []
        self.warnings: list[tuple] = []

    def add(self, severity: str, page: str, line_no: int,
            line: str, message: str) -> None:
        rec = (page, line_no, line.strip()[:140], message)
        (self.errors if severity == 'error' else self.warnings).append(rec)


# ────── CHECKS ──────
def check_iran_day_count(today: dt.date, page: str, lines: list[str],
                          issues: Issues) -> None:
    expected = iran_day_for(today)
    span_rx = re.compile(r'class="iran-day-count[^"]*"[^>]*>(\d+)<')
    id_rx = re.compile(r'id="iranDayCount"[^>]*>(\d+)<')
    for i, line in enumerate(lines, start=1):
        for rx, label in [(span_rx, 'iran-day-count'),
                          (id_rx, 'iranDayCount')]:
            for m in rx.finditer(line):
                n = int(m.group(1))
                if n != expected:
                    issues.add('error', page, i, line,
                               f'{label} = Day {n}, expected Day {expected}')


_TAG_RE = re.compile(r'<[^>]+>')


def _strip_tags(s: str) -> str:
    return _TAG_RE.sub(' ', s)


def check_iran_day_text(today: dt.date, page: str, lines: list[str],
                         issues: Issues) -> None:
    """Plain-text 'Day NN of the war' / 'IRAN · DAY NN' patterns."""
    expected = iran_day_for(today)
    patterns = [
        re.compile(r'IRAN[^A-Za-z]+DAY\s*(\d{2,3})\b', re.IGNORECASE),
        re.compile(r'\bDay\s*(\d{2,3})\s+of\s+(?:the\s+)?(?:war|US\s+blockade)\b',
                   re.IGNORECASE),
    ]
    for i, line in enumerate(lines, start=1):
        if line.lstrip().startswith(('/*', '*', '#')):
            continue
        # Strip HTML tags so "<b>57</b> of the war" matches the regex.
        text = _strip_tags(line)
        for rx in patterns:
            for m in rx.finditer(text):
                n = int(m.group(1))
                if n != expected:
                    issues.add('error', page, i, line,
                               f'"{m.group(0)}" — expected Day {expected}')


def check_countdowns(today: dt.date, page: str, lines: list[str],
                      issues: Issues) -> None:
    """'6 days to May 1', 'Six Days To May 1', 'in 3 days until Apr 30'."""
    rx = re.compile(
        r'\b(?:in\s+)?'
        r'(?:(\d+)|([A-Za-z]+))\s+'                  # "6" or "Six"
        r'days?\s+'
        r'(?:to|until|out\s+from|away\s+from)\s+'
        r'(' + '|'.join(MONTHS_SHORT) + r')[a-z]*'   # May
        r'\s+(\d{1,2})\b',                            # 1
        re.IGNORECASE,
    )
    for i, line in enumerate(lines, start=1):
        for m in rx.finditer(line):
            num_s, word_s, mo, day_s = m.groups()
            mo = mo.title()
            n = parse_count(num_s, word_s)
            if n is None:
                continue
            try:
                day = int(day_s)
                target = dt.date(today.year, MONTH_TO_NUM[mo], day)
            except (ValueError, KeyError):
                continue
            # If target is in the past, assume next year (e.g. for FOMC dates)
            # but only if it's more than 7 days past.
            if target < today - dt.timedelta(days=7):
                target = dt.date(today.year + 1, MONTH_TO_NUM[mo], day)
            elif target < today:
                # Past-but-recent: countdown is meaningless (event happened)
                issues.add('error', page, i, line,
                           f'"{m.group(0)}" — {mo} {day} is in the past '
                           f'({(today-target).days} days ago)')
                continue
            actual = (target - today).days
            if n != actual:
                issues.add('error', page, i, line,
                           f'"{m.group(0)}" — actually {actual} days from {today}')


def check_updated_labels(today: dt.date, page: str, lines: list[str],
                          issues: Issues) -> None:
    """'Updated: Sat Apr 25' → flag if > 2 days old.
    'Last refresh: Tue Apr 28' → flag if > 1 day old."""
    upd_rx = re.compile(
        r'(Updated|UPDATED|AS OF|OSINT AS OF|Last refresh)\s*:\s*'
        r'<[^>]*?>?\s*'                               # tolerate <span> wrappers
        r'([A-Z][a-z]{2}\s+[A-Z][a-z]{2}\s+\d{1,2})',
    )
    for i, line in enumerate(lines, start=1):
        for m in upd_rx.finditer(line):
            kind = m.group(1)
            date = parse_short_date(m.group(2), today)
            if not date:
                continue
            age = (today - date).days
            limit = 1 if 'refresh' in kind.lower() else 2
            if age > limit:
                severity = 'error' if age > limit + 2 else 'warning'
                issues.add(severity, page, i, line,
                           f'{kind}: {m.group(2)} is {age} days old '
                           f'(limit {limit})')


# ────── DRIVER ──────
def fetch_page(name: str, live: bool, root: Path) -> str:
    if live:
        url = f'https://fourfingersnews.com/{name}?_t={dt.datetime.now().timestamp():.0f}'
        return urllib.request.urlopen(url, timeout=20).read().decode('utf-8')
    return (root / name).read_text(encoding='utf-8')


def run(today: dt.date, live: bool, root: Path) -> int:
    issues = Issues()
    print(f'{BOLD}Freshness lint{RESET} {DIM}(today: {today}, '
          f'expected Iran Day: {iran_day_for(today)}, source: '
          f'{"live" if live else root}){RESET}')
    print()
    for page in PAGES:
        try:
            html = fetch_page(page, live, root)
        except FileNotFoundError:
            print(f'  {YELLOW}skip{RESET}   {page} (not found)')
            continue
        except Exception as e:
            print(f'  {RED}fail{RESET}   {page} ({e})')
            continue
        lines = html.split('\n')
        check_iran_day_count(today, page, lines, issues)
        check_iran_day_text(today, page, lines, issues)
        check_countdowns(today, page, lines, issues)
        check_updated_labels(today, page, lines, issues)

    if issues.errors:
        print(f'{RED}{BOLD}ERRORS ({len(issues.errors)}){RESET}')
        for page, ln, ctx, msg in issues.errors:
            print(f'  {RED}✗{RESET} {page}:{ln}  {msg}')
            print(f'    {DIM}{ctx}{RESET}')
        print()
    if issues.warnings:
        print(f'{YELLOW}{BOLD}WARNINGS ({len(issues.warnings)}){RESET}')
        for page, ln, ctx, msg in issues.warnings:
            print(f'  {YELLOW}!{RESET} {page}:{ln}  {msg}')
            print(f'    {DIM}{ctx}{RESET}')
        print()

    total = len(issues.errors) + len(issues.warnings)
    if total == 0:
        print(f'{BOLD}✓ clean{RESET} — checked {len(PAGES)} pages, no stale content detected')
    else:
        print(f'{BOLD}{total} issue(s){RESET}: '
              f'{len(issues.errors)} error(s), {len(issues.warnings)} warning(s)')
        # Per-page summary so the CI report has a tl;dr at the bottom.
        from collections import Counter
        per_page = Counter(p for p, *_ in issues.errors + issues.warnings)
        print(f'  by page: ' + ', '.join(f'{p}({n})' for p, n in per_page.most_common()))
    return len(issues.errors)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n', 1)[0])
    ap.add_argument('--live', action='store_true',
                    help='fetch pages from fourfingersnews.com')
    ap.add_argument('--date', type=str, default=None,
                    help='YYYY-MM-DD to pretend today is (default: actual today)')
    ap.add_argument('--root', type=str, default='.',
                    help='repo root for local files (default: current dir)')
    args = ap.parse_args()

    today = (dt.date.fromisoformat(args.date) if args.date
             else _today_pacific())
    return run(today, args.live, Path(args.root))


def _today_pacific() -> dt.date:
    """Return today's date in America/Los_Angeles. The site is PT-based;
    if we ran with UTC during the late-evening PT hours, the Iran day
    counter would always be off by one."""
    try:
        from zoneinfo import ZoneInfo
        return dt.datetime.now(tz=ZoneInfo('America/Los_Angeles')).date()
    except Exception:
        return dt.date.today()


if __name__ == '__main__':
    sys.exit(main())
