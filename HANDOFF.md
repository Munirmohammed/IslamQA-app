# IslamQA / Quran App — Project Handoff

**Read this whole file before doing anything.** This is the single source of
truth for a new Claude Code session picking up this project cold. It covers
the vision, everything already built, every real bug already found and
fixed (so they don't get rediscovered), what's genuinely next, and exactly
what's blocked on something only the user can do (a real device, an EAS
build, native Swift) rather than more Claude Code time.

---

## 0. The Vision

Build **the most advanced Quran app in the world** — not a thin wrapper
around an API, genuinely best-in-class: beautiful, catchy, reliable, easy to
use, and pushing into territory existing apps (Tarteel, Quranly, Quran.com)
don't cover. Two repos, built together:

- **Backend** (`C:\Users\yeabs\Desktop\me\IslamQA`, GitHub:
  `Munirmohammed/IslamQA`) — a FastAPI Python backend. Started as an Islamic
  Q&A chatbot (scraped fatwa Q&A, hybrid search), then grew a second, much
  bigger product surface: a full AI-powered Quran platform (voice search,
  recitation checking, gamification, memorization, tajweed, teacher mode,
  tafsir). **7 phases shipped**, plus a small Phase 3 extension (daily
  activity history) and a dev-mode CORS fix added this session. **185
  backend tests passing.**
- **Frontend** (`C:\Users\yeabs\Desktop\me\IslamQA-app`, GitHub:
  `Munirmohammed/IslamQA-app`) — React Native + Expo, iOS first (the user's
  own iPhone is the test device, via Expo Go), then Android, then web, all
  from one codebase. **F0 through F7 shipped** (see §5) — every backend
  phase that had a ready, unused API now has a real screen built against
  it. The app has a real brand identity: **"Qalam"** (قلم, "pen").

The user's own words on ambition: *"use all our advanced backend systems and
also add more features that we cant even imagine of ... that are not
currently existing and are very advanced and hard to do."* Every phase below
was planned with that bar in mind — real, verified, novel features, not
padding.

**Working style established across this whole project (follow it exactly):**
1. Before building on any external API/library, **verify it for real**
   (curl it, read its actual response shape, check actual version/package
   availability, fetch the real current Expo docs) — don't assume from
   training knowledge, which is often stale by the time you're building.
   This caught real bugs constantly (see §4).
2. For anything non-trivial, write a short plan and get it approved before
   writing code. Keep plans honest: explicitly say what's *not* being built
   and why.
3. Ship one complete, demoable vertical slice at a time. **Actually test
   it** — not just typecheck/lint, but exercise the real behavior: a
   headless browser (Playwright) driving the web target for UI/crash
   verification, direct `curl` calls against the live backend for data
   correctness, and the real test suite for backend logic. Typecheck and
   lint catch syntax, not behavior — this session's biggest lesson was that
   several real bugs (a stuck "Unmatched Route" crash, a silent file-write
   no-op, a nested-touchable conflict) were only caught by actually running
   the thing, never by typecheck alone.
4. Never fake a feature to look more finished than it is. If something is
   genuinely hard or blocked on something only the user can do (on-device
   ASR, Apple Watch, a real device, an EAS build), say so plainly and defer
   it — see §6 for the current honest list.

---

## 1. Current State (exactly where things stopped)

- Backend is **running locally**, port 8000, from `IslamQA\.venv` (the
  project's dedicated venv — see §4 item 14 for a real gotcha about this).
- **Network has changed multiple times this session (again)** — don't
  trust any IP written down here without re-checking. At last check the
  machine was on IP `192.168.1.102` (gateway `192.168.1.1`); `IslamQA-app/.env`
  holds `EXPO_PUBLIC_API_URL=http://192.168.1.102:8000`. **Re-verify this
  against the actual current IP** (`ipconfig` / `Get-NetIPAddress` — pick
  the adapter with a real default gateway, not a VirtualBox/ICS-hotspot
  virtual adapter) before trusting it; a network switch (different WiFi,
  hotspot on/off) changes it silently and nothing will connect until
  `.env` is updated and Metro is restarted with `--clear` (env vars are
  inlined into the JS bundle at build time, so editing `.env` alone does
  nothing until Metro rebuilds). This drift happened mid-session and
  caused real login failures in the web self-test harness — see §4 item 24
  for the related (but different) web-login bug it surfaced.
- **A port-based Windows Firewall rule exists** — `New-NetFirewallRule
  -DisplayName "IslamQA backend (port 8000)" -Direction Inbound -Action
  Allow -Protocol TCP -LocalPort 8000 -Profile Any` — this is the *correct*
  fix (see §4 item 14 for why a program-path-based rule silently doesn't
  work for this specific venv). If the phone can't reach the backend again
  on a new network, re-run that exact command (needs an elevated
  PowerShell — the user has to do this, Claude Code doesn't have admin
  rights) rather than trying ngrok or a program-path rule again.
- **Demo accounts exist** for quick testing, already seeded with realistic
  data via `IslamQA/scripts/seed_gamification_demo_data.py` (idempotent,
  safe to re-run): username `demo`, password `demo123` (14-day streak,
  8040 hasanat, ranks #1 on the leaderboard), plus 4 more seeded accounts
  (`Aisha_Q`, `Yusuf92`, `Fatima_reads`, `Omar_K`) so the leaderboard and
  heatmap don't look empty. Also `demo_tester` / `TestPass123!` from
  earlier ad-hoc testing (joined to a test halaqa).
- **Everything in §5 has been self-tested** by Claude (Playwright against
  the web target + direct backend `curl` calls + the real pytest suite,
  228+ passing). The first real **on-device pass has now happened** (not
  just self-testing) and found genuine bugs self-testing missed — see §4
  items 24, 26-27 for the two most significant (token refresh, the Al-
  Fatiha BOM, Whisper hallucinating short clips) — all fixed and verified.
  That pass was against the *old* 4-tab nav, though: the 5-tab restructure
  and visual pass (§5 third build batch) still only has web-harness
  verification. **A fresh on-device pass against the new nav is the next
  most valuable thing to do**, not a full repeat from scratch.
- `src/components/launch-animation.tsx` is the real app-launch sequence:
  the Qalam mark (a pen-stroke swash, path data shared via
  `src/constants/brand-mark.ts`) draws itself, spins once, reveals a
  "قلم / Qalam" wordmark, then settles. Built with `react-native-svg` +
  `react-native-reanimated`.

### To resume right now:
```powershell
# Terminal 1 — backend
cd C:\Users\yeabs\Desktop\me\IslamQA
.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Check current IP and update IslamQA-app\.env if it's changed:
# EXPO_PUBLIC_API_URL=http://<current-ip>:8000

# Terminal 2 — frontend (--clear is important if .env just changed)
cd C:\Users\yeabs\Desktop\me\IslamQA-app
npx expo start --clear
# scan the QR code with Expo Go on the iPhone, or "Enter URL manually"
```

If the phone can't reach the backend: confirm both devices are on the
*same* WiFi/hotspot network, confirm **both** firewall rules exist and are
enabled (`Get-NetFirewallRule -DisplayName "IslamQA backend (port 8000)"`
and `"IslamQA Metro (port 8081)"` — Metro needs one too, not just the
backend), confirm Windows categorizes that network as anything (the
port-based rules use `-Profile Any` so this shouldn't matter, but verify)
— do **not** reach for ngrok as a first resort this time; the backend
tunnel pattern from early in this project had its own problems (see §4
item 15) and the direct-LAN fix is more reliable once both firewall rules
are in place.

---

## 2. Backend — Phases 1-8 (all shipped), plus this session's additions

Repo: `C:\Users\yeabs\Desktop\me\IslamQA`. Pre-existing before this whole
Quran initiative: an Islamic Q&A chatbot backend (scraped fatwa Q&A from
IslamQA.info/Dar al-Ifta, hybrid retrieval: BM25 + dense FAISS + Reciprocal
Rank Fusion + cross-encoder rerank + char n-gram fuzzy fallback — see
`app/services/{bm25,fusion,rerank,fuzzy_match}_service.py`). That hybrid
retrieval stack turned out to be the single most-reused piece of
infrastructure across every Quran phase below.

| # | Phase | What it does | Key files |
|---|-------|---------------|-----------|
| 1 | Voice search ("Tasmeea") | Recite/type a Quran fragment → find the matching ayah. Reuses the Q&A hybrid retrieval stack pointed at ayah text instead of Q&A pairs. | `quran_corpus_service.py`, `voice_search_service.py` |
| 2 | Recitation mistake-checker | Upload audio → self-hosted Whisper ASR (`tarteel-ai/whisper-base-ar-quran`) → transcript → word-level diff (`difflib`) against canonical ayah → incorrect/missed/extra word list. | `recitation_asr_service.py`, `recitation_diff_service.py`, `endpoints/recitation.py` |
| 3 | Gamification | Streaks, hasanat (reward count — real hadith-based 10x-per-letter, not an arbitrary score), global leaderboard. **Extended this session**: a `daily_activity` table + `GET /gamification/history` endpoint, zero-filled per-day verse/hasanat totals — the real calendar-heatmap data source the original Phase 3 (`UserStreak` alone) couldn't answer. | `gamification_service.py` |
| 4 | Memorization (Hifz) | Standard SM-2 spaced repetition, gradeable directly *or* derived from a Phase 2 mistake count. Mutashabihat (confusable-verse) lookup reuses Phase 1's search engine with zero new infra. | `srs_service.py` |
| 5 | Tajweed annotation | Which letters carry which tajweed rule (qalqalah, madd, idgham, ikhfa...), sourced from Quran.com's own tajweed-coloring API. **17 raw rule codes** — see §4 item 16 for why the frontend groups them into 7 color families instead of using all 17. | `tajweed_service.py` |
| 6 | Halaqa/teacher mode | Teacher creates a circle, students join by code, teacher reviews recitation history. Also persists Phase 2's recitation checks to the DB (`RecitationSession`/`MistakeLog`). | `halaqa_service.py` |
| 7 | Tafsir lookup + search | Real Quranic exegesis (Ibn Kathir Abridged, English) per ayah, plus free-text search over the whole tafsir corpus using the same Phase 1 retrieval pattern. | `tafsir_service.py`, `tafsir_search_service.py` |
| 8 | Quran content/browse API | Plain `GET /quran/surahs` + `GET /quran/{surah}` — the Mushaf-reading endpoint. | `endpoints/quran.py` |

**Deliberately *not* built, and why (don't silently try to "complete" these
without re-reading the reasoning — they were skipped on purpose):**
- Real audio-liveness anti-cheat (detecting playback vs. live mic) — needs
  dedicated audio-ML research. What *is* built instead: an honestly-labeled
  duplicate-audio-hash flag (same file submitted by two different accounts).
- Acoustic tajweed scoring (measuring actual madd duration/ghunnah from
  audio) — same research-grade category, deferred.
- Apple Watch, true on-device offline ASR — see §6, same treatment.
- **Reciter audio serving** (a library of reference recitation audio to
  download/play) — confirmed by reading every endpoint file that this does
  **not exist**. `recitation.py`'s audio handling is upload-for-checking
  only. This matters: the frontend's offline-packs feature (F7) is
  deliberately text-only because of this — see F7 below.

### Backend #10-13 (planned, not yet built — pull forward exactly when the
frontend phase needing them starts):
- ~~#9 Mistake-pattern analytics~~ ✅ shipped (second build batch) as
  `app/services/mistake_pattern_service.py` + `GET /recitation/my-mistakes`
  — mistake-type tally, top mistaken words, per-surah correct-rate
  breakdown. Powers the "Tajweed Coach" dashboard.
- **#10 Assignments** — teacher assigns an ayah range + due date in a
  halaqa; student's matching `RecitationSession`s auto-satisfy it. F6's
  core (roster, per-student drill-down) is shipped; this is the one piece
  of the original F6 sketch still deferred.
- **#11 Social graph** — `FriendRequest`/`Friendship` + a `scope=friends`
  leaderboard option (Phase 3's leaderboard is global-only right now).
  Needed for F10 (Android parity pass).
- **#12 Push notifications** — device token registration + a dispatch
  service (Expo's push service brokers both APNs and FCM from one API).
  Nothing like this exists yet. Needed for F10.
- **#13 Reading plans** — structured multi-day plans ("Quran in Ramadan")
  scheduling `gamification.log_progress` targets. Needed for F10.

---

## 3. Frontend — Tech Decisions (confirmed with user, don't re-litigate)

- **React Native + Expo**, not native Swift/Kotlin, not Flutter. One
  codebase → iOS + Android + (Expo web export) web.
- **No Mac needed, ever.** EAS Build compiles signed iOS binaries on
  Expo-hosted macOS workers. Expo Go (free App Store app) is how the
  iPhone runs the app during early development with zero native build
  step — this remains true through F0-F7; **F8 onward needs an EAS
  development build**, the first time this stops being true (see §6).
- Expo SDK 57, React Native 0.86.x, **New Architecture mandatory**
  (Fabric/TurboModules). TypeScript. Expo Router (file-based, `src/app/`),
  **React Compiler enabled** — see §4 item 17 for a real purity-rule
  gotcha this caused.
- **State**: TanStack Query (all server state) + Zustand (client state
  only — theme, the access token). Don't reintroduce a Redux-style "copy
  API data into a global store" pattern.
- **Audio**: `expo-audio`, not the deprecated `expo-av`.
- **File system / uploads / downloads**: `expo-file-system`'s newer
  `File`/`Directory`/`Paths` class API (not the older function-based API).
  Used for: multipart upload (`src/lib/api-client.ts`'s `apiUpload`),
  the shareable-ayah-card image capture pairing with `react-native-view-shot`
  + `expo-sharing`, and F7's offline surah packs (`src/lib/offline-packs.ts`).
  **Has no web implementation** — confirmed (warns "expo-file-system is
  not supported on web" and no-ops rather than crashing); every
  `offline-packs.ts` function is wrapped defensively so this degrades
  gracefully rather than breaking the app on platforms without it.
- **Text-to-speech**: `expo-speech`, used by Practice's hands-free session
  mode. Confirmed Expo Go compatible (`npx expo install expo-speech`, no
  dev build needed) before using it — don't assume, the project's own
  rule is to check every time.
- Path alias `@/` → `src/`. Repo root has its own `package.json`, fully
  separate from the Python backend (sibling folder, separate git history,
  separate GitHub repo).
- **Self-testing method established this session**: since there's no
  real device in Claude's own dev loop, the verification pattern that
  actually catches bugs is `npx expo start --web --port 19006` (a
  *separate* web instance from the one serving the phone on 8081, so
  testing doesn't disrupt the phone's connection) + a headless Chromium
  via Playwright (`npx playwright install chromium`, installed once this
  session) driving it. This caught several real bugs (see §4) that
  typecheck/lint never would have. Known limitations of this method:
  `expo-secure-store`, `expo-file-system`'s File API, and real microphone
  input don't work on web, so auth-gated and file/audio-dependent flows
  can only be verified structurally (renders without crashing, correct
  data threading) on web — their actual behavior still needs the real
  device for full confidence.

---

## 4. Real bugs/gotchas already found and fixed — DO NOT REDISCOVER THESE

This project's whole discipline has been "verify before building," and it
paid off constantly. Read this section before touching the corresponding
area again.

1. **Basmalah embedded in ayah 1 text** (alquran.cloud's `quran-uthmani`
   edition prefixes every surah's ayah 1 — except Al-Fatiha and At-Tawbah —
   with the Basmalah). Fixed in `quran_corpus_service.py` by splitting it
   into its own `basmalah` field. **Quran.com's tajweed/tafsir APIs do NOT
   have this bug** — don't assume it applies everywhere.
2. **Whisper `generate()` gotcha**: do not pass `language=`/`task=` kwargs
   to `tarteel-ai/whisper-base-ar-quran`'s `.generate()` — newer
   `transformers` raises "generation config is outdated" against this
   checkpoint's `generation_config.json`.
3. **Tajweed/tafsir API pagination**: `api.quran.com`'s tafsir `by_chapter`
   endpoint silently paginates at 10 ayahs/page for long surahs. Fix:
   `per_page=300`. The tajweed `uthmani_tajweed` endpoint does NOT
   paginate — confirmed separately.
4. **Tafsir text is shared across grouped ayahs**: Ibn Kathir's commentary
   is often written once for several consecutive ayahs. `tafsir_service.py`'s
   `_build_blocks_for_chapter` tracks `(ayah_from, ayah_to)` ranges so every
   ayah in a group resolves to the shared text, not emptiness.
5. **Audio format for recitation upload**: the backend decodes via
   `soundfile`/libsndfile — WAV/MP3/FLAC/OGG only, NOT AAC/M4A (expo-audio's
   default!) and NOT WebM/Opus. `RECITATION_RECORDING_OPTIONS`
   (`src/lib/audio-recording-options.ts`) forces WAV/LINEARPCM on iOS.
   **Android has no raw-PCM/WAV option in expo-audio's `AndroidOutputFormat`
   enum at all** — a known, flagged gap for F10, not an oversight.
6. **Arabic combining-mark transcription risk**: don't hand-type Arabic
   literal strings as test expectations — derive expected values from real
   corpus/fixture data instead.
7. **Test isolation**: the test suite's DB is a real, shared, persistent
   SQLite file across the whole pytest session. Any test creating a `User`
   needs a unique username/email per invocation; any test building a search
   index must redirect to a `tmp_path` fixture.
8. **CRLF line-ending corruption**: editing `app/main.py` /
   `app/core/database.py` with the Edit tool once converted LF to CRLF.
   Re-check `git diff --stat` if a diff looks suspiciously large.
9. **expo-audio recording presets default to M4A/AAC**. `expo-av` is fully
   removed from Expo Go as of SDK 55; always use `expo-audio`.
10. **CPU-bound work inside `async def` doesn't yield to the event loop by
    itself.** `check_recitation`'s Whisper transcription and
    `VoiceSearchService.search`'s FAISS/BM25/rerank work are plain
    synchronous calls — without `await asyncio.to_thread(...)`, one slow
    request blocks every other in-flight request. Fixed in both places.
    **Check for this pattern before adding more synchronous-but-slow
    backend work.**
11. **`create_tables()` was never called from real app startup** — only
    from test fixtures and the seed script. `app/main.py`'s lifespan now
    calls it (idempotent) before initializing services. Before this fix,
    every table added from Phase 3 onward silently didn't exist outside
    tests.
12. **React Native's classic FormData `{uri, name, type}` file shape
    doesn't work with Expo SDK 57's `fetch` polyfill at all** — throws
    "Unsupported FormDataPart implementation" (the polyfill only accepts a
    real Blob/File-like value with a `.bytes()` method). `apiUpload` uses
    `expo-file-system`'s `File#upload()` instead of `fetch`+`FormData` —
    bypasses `fetch` entirely. Reuse `apiUpload` for any future upload,
    don't reintroduce raw FormData.
13. **`NativeTabs` (the new `expo-router/unstable-native-tabs` API) does
    not provide a stack for its tab routes.** A tab that needs to push a
    second screen on top of it (anything beyond the tab's own root) needs
    its **own nested `_layout.tsx` with a `<Stack>`** — confirmed against
    real Expo docs, not assumed. This is why `Home` and `Profile` moved
    from flat files (`src/app/index.tsx`, `src/app/profile.tsx`) into
    folders (`src/app/home/`, `src/app/profile/`) this session, each with
    its own `_layout.tsx`. **A bare root route (`src/app/index.tsx`) must
    still exist as a `<Redirect href="/home" />`** — moving the real Home
    screen out of that slot without leaving a redirect produces a real
    "Unmatched Route" crash on cold start (this happened once this
    session; the fix was the redirect file, not a deeper routing bug).
14. **On Windows, a Python venv's `Scripts\python.exe` is a small launcher,
    not a real copy of the interpreter** — the actual process that ends up
    bound to a port is the *base* interpreter the venv points to (check
    `pyvenv.cfg`'s `home` field), confirmed via `Get-CimInstance
    Win32_Process` showing the bound PID's `ExecutablePath` as the base
    install, not the venv path. **A Windows Firewall rule scoped to the
    venv's own `python.exe` path silently never matches anything** —
    this wasted real time earlier in the project's life (HANDOFF's
    original firewall troubleshooting assumed the venv path was correct).
    **Fix: use a port-based rule** (`-LocalPort 8000`, no `-Program`
    clause) instead of a program-path rule — works regardless of which
    interpreter ends up bound.
15. **Ngrok's free tier only grants one real public hostname per
    account.** Trying to tunnel a second local port (Metro's 8081,
    alongside the backend's 8000) under the same account either fails
    outright or — worse — silently pools both ports onto the *same*
    hostname (confirmed: both endpoints returned the identical
    `public_url`, meaning requests would randomly route to either
    service). **Don't reach for a second ngrok tunnel to solve a
    connectivity problem** — the real fix for phone-can't-reach-backend
    is the direct-LAN + firewall-rule path in §1, not a tunnel.
16. **Tajweed endpoint's `plain_text` comes from a different upstream
    source than Phase 1's `text_uthmani`** (Quran.com vs. alquran.cloud).
    The two Uthmani strings can differ in minor rendering details that
    would silently misalign a rule span's character offsets if cross-
    applied — this is flagged directly in `tajweed_service.py`'s own
    docstring. **Always render the tajweed endpoint's own `plain_text`
    for its rule spans, never overlay them onto a different ayah-text
    source.** Separately, the 17 raw rule codes were grouped into 7 color
    families client-side (`src/constants/tajweed-colors.ts`) rather than
    given 17 distinct hues — real tajweed mushafs do the same, and 17
    genuinely-distinguishable colors isn't achievable anyway (validated
    with the dataviz skill's `validate_palette.js` against this app's own
    light/dark surfaces, not eyeballed).
17. **React Compiler's purity rules reject `Math.random()` inside
    `useMemo`** (`react-hooks/purity` — a memoized value must be
    idempotent, which a random pick inherently isn't) **and reject
    `setState` called directly inside a `useEffect` body**
    (`react-hooks/set-state-in-effect`, unless it's a one-time hydration
    flag with a justified inline disable, see
    `src/hooks/use-color-scheme.web.ts`). The correct pattern for "pick
    something random exactly once when new data arrives" is a **lazy
    `useState` initializer** (`useState(() => computeOnce(data))`) in a
    child component that mounts fresh per data load — the one place
    React's rules explicitly allow one-time impure computation. See
    `src/app/read/quiz.tsx`'s `QuizBody` for the pattern.
18. **A CSS `transform` on an SVG element silently overrides (not
    combines with) an SVG `transform=""` attribute on the same element**,
    on web specifically. `launch-animation.tsx`'s spin animation once set
    `style.transform = 'rotate(...)'` on a `<g>` that also had
    `transform="translate(512 512)"` as an attribute — the translate
    vanished, collapsing the whole mark into the top-left corner. Fix:
    bake the translate into the *same* CSS transform string
    (`translate(512px,512px) rotate(Ndeg)`), never split a translate
    across the attribute and a CSS override on the same element.
19. **`react-native-svg`'s `Path#getTotalLength()` isn't guaranteed on
    every platform** (confirmed: throws "is not a function" on web,
    works correctly on native). Any stroke-draw animation using it should
    check `typeof ref.current?.getTotalLength === 'function'` before
    calling, and degrade gracefully (skip the animation, call the
    completion callback immediately) rather than crash — see
    `launch-animation.tsx`'s `tryMeasure`.
20. **`auth-store.ts`'s `hydrate()` had no error handling** — since
    `isHydrating` gates the entire app's first render, a thrown
    `SecureStore` read (guaranteed on web, possible on a real device too)
    left the app stuck on a permanent blank screen. Fixed with a
    try/catch that falls back to a logged-out state. **Any store value
    that gates the root render must never be able to throw its way into
    a stuck state.**
21. **A nested `Pressable` inside a `Link`'s own `Pressable` doesn't
    reliably stop touch propagation on web even with
    `event.stopPropagation()`** (confirmed: tapping a download badge
    nested inside a surah row's navigation target still triggered
    navigation). **Fix structurally, not with stopPropagation**: make the
    inner interactive element a sibling of the outer `Link`/`Pressable`,
    never nested inside it — see `src/components/surah-list-item.tsx`.
22. **`TextInput`'s `onSubmitEditing` didn't reliably fire via a
    simulated Enter keypress on web** (the "Ask the Quran" search). Added
    an explicit Search button as the primary trigger rather than relying
    solely on the keyboard-submit event — also just better UX regardless
    of the underlying cause.
23. **The backend had no CORS headers configured at all**
    (`ALLOWED_ORIGINS` defaulted to `localhost:3000`/`8080`, matching
    neither Expo's web dev server nor anything else actually used).
    Without this, the web self-testing method in §3 couldn't make any API
    call from a real browser context — blocked Claude's own ability to
    verify things, not just a future web-platform concern. Fixed in
    `app/main.py`: `allow_origins=["*"]` and `allow_credentials=False`
    specifically when `settings.DEBUG` is true (the local/demo-scale
    default); production keeps the explicit origin list with credentials.
    The two are mutually exclusive per the CORS spec, and this app's auth
    is a Bearer token header, not a cookie, so dropping credentials in
    debug mode costs nothing.
24. **`auth-store.ts`'s `setTokens`/`clearTokens` awaited SecureStore writes
    before updating in-memory state** — since `expo-secure-store` has no
    web implementation, every login silently failed on the web target
    (the mutation threw before `set({accessToken, ...})` ran). Fixed the
    same way `hydrate()` already handles the read side: try/catch around
    the persistence call, update in-memory state regardless. Web sessions
    just don't survive a reload, which is the correct tradeoff, not a bug.
25. **Running the full backend test suite while the dev server, Metro, and
    Playwright are all live on the same machine causes severe resource
    contention** — one run took 3.5 hours and produced 97 spurious errors
    in files nobody had touched (ML model loading / corpus fixtures timing
    out under CPU starvation), while the exact same suite run in isolation
    seconds later passed cleanly in under 5 minutes. If a full-suite run
    looks catastrophic, stop the dev server/Metro first and re-run before
    assuming a real regression.
26. **The Quran corpus's very first ayah (1:1) carried a leading U+FEFF
    BOM** in `text_uthmani`/`text_simple` — alquran.cloud's raw data for
    just that one entry, not the whole corpus. The Basmalah-split path
    incidentally strips this for every *other* surah's ayah 1, but 1:1
    skips that path (it IS the Basmalah), so the BOM survived and made
    the recitation checker flag a false "incorrect" mistake on the very
    first word of literally every attempt at the first ayah of the
    Quran — even a perfect recitation. Fixed by stripping a leading BOM
    unconditionally in `_merge_editions`, plus patching the already-
    cached `data/quran/quran_corpus.json`.
27. **Whisper hallucinates a full ayah's completion from a short/partial
    clip** — this checkpoint is fine-tuned specifically on Quranic
    recitation, so it has an unusually strong prior toward "finishing"
    a well-known ayah even when only its first word or two was actually
    said, silently hiding every word the user never recited. Fixed by
    capping `max_new_tokens` to roughly what the audio's own duration
    could contain (`recitation_asr_service.py`), plus rejecting audio
    under 0.3s outright. This is a real, demonstrated limitation of
    small Whisper checkpoints on short inputs, not specific to this one
    model — keep the duration cap if the model is ever swapped.
28. **`npx expo start` backgrounded via this session's task tooling
    routinely leaves a zombie `node.exe` holding the port after the task
    is "stopped"** — `TaskStop`/killing the wrapper shell does not
    reliably kill the underlying Metro process on Windows. Restarting
    "the same" dev server repeatedly without checking `netstat` can mean
    every "restart" is actually still hitting the old zombie, serving
    stale bundled code *and* a stale `.expo/types/router.d.ts` (see next
    item) — this cost real time during the nav restructure, where moved/
    deleted routes kept reappearing as "still valid" in `tsc`'s eyes.
    Always verify with `netstat -ano | grep ":<port>"` and `taskkill //F
    //PID <pid>` for anything unexpected before trusting a "fresh" start.
29. **Expo Router's typed-routes generation
    (`.expo/types/router.d.ts`) is unreliable across a directory
    restructure** — bare-directory shorthand hrefs (`/quran` resolving
    to `quran/index.tsx`) only reliably appear after a genuinely cold
    start (stray process killed, `.expo/types` *and* `node_modules/.cache`
    deleted, then `expo start --clear`); incremental regeneration during
    a live session can silently keep stale entries for deleted routes
    (`/read`, `/profile` kept appearing minutes after those directories
    were gone) while never adding the new bare-path aliases. If `tsc`
    rejects an href that's obviously a real route, suspect this before
    the route code itself — confirm by grepping
    `.expo/types/router.d.ts` directly for the exact literal path.
30. **A screen moved from "has a native Stack header" to "is a tab
    landing with `headerShown: false` and its own in-body title" needs
    its `SafeAreaView`'s `edges` prop revisited** — `edges={['bottom']}`
    was correct when a real header reserved the top safe area; carried
    over unchanged, it leaves zero top clearance once that header is
    gone, and the screen's own title renders flush against the status
    bar on native (invisible on web too, hidden behind the floating web
    tab bar's pill, which sits `position: absolute` over the content).
    Fix: drop to the default (all-edges) `SafeAreaView` and match
    Home's `paddingTop: Spacing.six` convention for tab landings.

---

## 5. Frontend Roadmap — F0 through F7 all SHIPPED, F8-F11 blocked (see §6)

### F0 — Foundation ✅ SHIPPED
Project scaffold, design system (`src/constants/theme.ts`), Arabic font
(Noto Naskh Arabic), TanStack Query + Zustand, typed API client, auth
screens, 4-tab nav shell, read-only Mushaf reader.

### F1 — Voice & Recitation Core ✅ SHIPPED
Tasmeea (recite any fragment, find the ayah) + practice-this-specific-ayah
mode, both on `src/app/practice.tsx`. Mistakes rendered as colored/
struck-through inline spans on the ayah's own text.

### F2 — Gamification ✅ SHIPPED
- Real streak/hasanat dashboard on Home (`src/app/home/index.tsx`),
  backed by Phase 3 + this session's new `/gamification/history` endpoint
- A genuine calendar heatmap (`src/components/activity-heatmap.tsx`) —
  real per-day data, not invented; this needed the backend extension
  above since `UserStreak` alone only tracks current/longest streak
- Global leaderboard (`src/app/home/leaderboard.tsx`)
- **Shareable ayah cards** (`src/components/share-ayah-button.tsx` +
  `shareable-ayah-card.tsx`): one-tap branded image (the Qalam mark +
  wordmark, verified visually) via `react-native-view-shot` +
  `expo-sharing`, wired into both the Read screen's `AyahCard` and
  Practice's result card
- **Hifz Garden** (`src/components/hifz-garden.tsx`, `src/app/profile/garden.tsx`)
  ✅ shipped in the second build batch — see below.

### F3 — Memorization (Hifz) UI ✅ SHIPPED
- "Add to Hifz" button on every ayah in Read
- Hifz Review screen (`src/app/profile/hifz.tsx`): Again/Hard/Good/Easy
  grading against the real SM-2 backend, verified end-to-end (added →
  appeared in due queue → grading correctly advanced the interval)
- Mutashabihat confusion quiz (`src/app/read/quiz.tsx`): "which of these
  is really X:Y", a random distractor from the backend's `/similar`
  endpoint — see §4 item 17 for a real React Compiler purity bug this
  surfaced and how it was fixed

### F4 — Tajweed-Colored Reader ✅ SHIPPED (Tajweed Coach ✅ also shipped)
Tap-to-reveal tajweed coloring on every ayah in Read
(`src/components/tajweed-text.tsx`), 7 color families validated for
colorblind-safety against the app's real surfaces (see §4 item 16).
Tapping a colored letter shows its rule name/description via `Alert`.
The personalized "Tajweed Coach" dashboard (`src/app/profile/coach.tsx`,
backend `GET /recitation/my-mistakes`) shipped in the second build batch —
correct rate, a mistake-type breakdown, most-missed words, and a per-surah
weakest-first breakdown, all from real `RecitationSession`/`MistakeLog`
history. Note it's scoped to *recitation-check* mistakes specifically, not
every tajweed-coloring tap — those are two separate signals that were
never unified, which is fine (they answer different questions) but worth
knowing if asked to "unify" them later.

### F5 — Tafsir & "Ask the Quran" ✅ SHIPPED
"Explain" button on every ayah → real Ibn Kathir commentary
(`src/app/read/tafsir.tsx`). A dedicated search screen
(`src/app/home/ask.tsx`) explicitly framed as retrieval, not a chatbot —
this remains the deliberate, documented stance from the original roadmap
sketch (the backend's older `hybrid_ai_service.py`/`simple_ai_service.py`
were read in full and found to be built on largely-retired free endpoints,
not a solid foundation — don't revisit without re-reading why).

### F6 — Halaqa/Teacher Mode ✅ SHIPPED (assignments still backend-#10-gated)
Create/join a halaqa, teacher roster (`src/app/profile/halaqa-roster.tsx`)
with per-student stats, drill into full session/mistake detail
(`src/app/profile/halaqa-student.tsx`). Verified end-to-end: created a
real halaqa as `demo`, joined as `demo_tester`, confirmed the roster. A
per-halaqa leaderboard (`src/app/profile/halaqa-leaderboard.tsx`, backend
`GET /halaqa/{id}/leaderboard`) shipped in the second build batch — reuses
the global leaderboard's ranking logic scoped to just that halaqa's
teacher + students, visible to any member (not teacher-only), linked from
both the teacher's roster and a student's "Studying" row.
Assigning homework (needs Backend #10) and "listen in" live mode (needs
the backend's WebSocket infra, a genuinely separate real-time undertaking)
are the two original F6 pieces still deferred.

### F7 — Offline Packs ✅ SHIPPED (text-only, see why below)
Download a surah for offline reading (`src/lib/offline-packs.ts` +
download badges in `src/components/surah-list-item.tsx`). **Deliberately
text-only**, not "text + audio" as the original roadmap sketch
described — confirmed by reading every backend endpoint that **no
reciter-audio-serving endpoint exists at all**; an "includes audio" pack
would have faked a capability the backend doesn't have. Tajweed
annotation is also left out of a pack (one request per ayah for a
286-ayah surah is a lot of round-trips for a supplementary feature) — a
reasonable fast-follow if offline tajweed is wanted. Has no web
implementation (confirmed: `expo-file-system` warns and no-ops on web,
doesn't crash) — this only matters for the self-testing method in §3, not
for the real iOS target, where this API is already proven working twice
over (recitation upload, share-card capture).

### Also shipped in the first build batch, from the feature catalog (§6) rather than the numbered roadmap:
- **Hands-free practice session** (`src/app/practice.tsx`): tap to record
  each ayah, then everything else is automated — the result is spoken
  aloud via `expo-speech` and the session auto-advances to the next ayah,
  so a reciter's eyes never have to leave the mushaf page. **Honestly
  scoped**: true zero-tap continuous recording would need voice-activity
  detection (silence-based auto-segmentation), a genuinely hard problem
  this doesn't attempt — this is a real, working "low-touch" version, not
  a faked full version. Verified the state machine (start/end session,
  UI transitions) via the web harness; the actual record→speak→auto-advance
  loop with a real recitation couldn't be exercised without a real
  microphone, so give this one particular attention on the first real
  on-device pass.

### Second build batch — competitor research-driven gap features, all shipped and tested
Prompted by "see what Tarteel/other Quran apps have that we don't."
Backend tests for all four: 215 → 221 passing (full suite, isolated run —
see §4 item 25 about not trusting a full-suite run contended with a live
dev server). Each verified live via the web self-testing method in §3
with real seeded data, not just unit tests.
- **Hifz Garden** (`src/components/hifz-garden.tsx`, `src/app/hifz/garden.tsx`,
  backend `GET /memorization/progress`): a juz "bed" of 30 buds that fill
  in as juz are memorized (fraction = ayahs learned / that juz's real
  ayah count, so a juz only blooms once *every* ayah in it is learned —
  deliberately strict, not a vanity metric), plus a per-surah leaf list
  with tracked-vs-learned progress bars. "Learned" reuses `srs_service`'s
  existing graduated-card threshold (repetitions≥2, interval≥6 days).
- **Tajweed Coach** — see F4 above.
- **Khatmah tracking** (`src/features/khatmah/`, `src/app/home/khatmah.tsx`,
  backend `app/services/khatmah_service.py` + `/khatmah/*`): tracks
  progress toward a full Quran read-through. New `Khatmah`/
  `KhatmahReadAyah` tables record *which* ayahs were read (not a counter),
  so re-reading never inflates progress and completion is exact regardless
  of reading order. Opening a surah in Read marks its ayahs read — the
  same coarse "a concrete action happened" signal the rest of the app
  uses, not scroll-accurate tracking. Auto-starts a khatmah on first read,
  auto-completes at 100%, and reading again after completion silently
  starts a fresh one (no dead-end UI state waiting for an explicit
  "start"). A "start a new khatmah" action exists for restarting early.
- **Halaqa leaderboard** — see F6 above.

**Not pursued from the research, with reasons** (don't re-propose without
new information):
- Multi-reciter audio library, word-by-word tap-translate, letter/rule-level
  tajweed scoring, ambient "Shazam for Quran" recitation ID — each needs
  new corpus data, a phonetic ML model, or a voice-embedding model that
  doesn't exist in this project; see §7's existing entries for the first
  two specifically.
- Reconsidering the chatbot decision — flagged during research as
  something competitors lean on, but F5's existing "retrieval, not a
  chatbot" stance (see F5 above) was a deliberate call already made this
  project, not an oversight; revisit only if the user explicitly asks.

### Third build batch — the first real on-device pass, then a structural/visual redesign
The first genuine on-device test surfaced real bugs self-testing never
would have (see §4 items 26-27 for the two most significant: the Al-Fatiha
1:1 BOM and Whisper's short-clip hallucination), plus UX feedback that
the app felt thin and unstructured despite its real feature breadth. Full
plan is (or was) at the session's plan file; summarized here:

**Bug fixes** (all with regression tests): the BOM fix, the ASR
hallucination cap, token auto-refresh (§4 item 24 territory — access
tokens expire in 30 min with no refresh, so any real session eventually
saw every screen fail silently while still looking logged in; `apiRequest`
now retries once through `/auth/refresh` on a 401, sharing one in-flight
refresh across concurrent failures), the Mutashabihat quiz redesign (it
used to launch from a specific ayah with that same ayah as the answer —
see new `GET /quran/random-ayah` and the rewritten `src/app/quran/quiz.tsx`),
"Ask the Quran"'s search-button/expand-collapse fixes, and the hands-free
practice session's forced-3s-auto-advance replaced with explicit
"Try again"/"Next ayah" actions (an 8s idle fallback remains for hands-off
use).

**Navigation restructure** (§4 items 28-30 cover the real tooling traps
hit along the way): 4 tabs → 5 — **Home** (dashboard), **Quran** (merges
the old Read + Practice + Ask the Quran — the core loop shouldn't be split
across tabs), **Hifz** (new hub: review queue, Garden, Tajweed Coach, all
one level deep instead of three separate Profile sub-screens), **Community**
(halaqas + both leaderboards), **More** (renamed from Profile, now just
account/auth — the feature links it used to hold moved to their own tabs).
Every route re-verified live via the web harness after the move.

**Design system**: `ThemedView` now applies a subtle shadow automatically
for `type="backgroundElement"` (the app's existing card convention) —
every card in the app got real depth from one change. New `Skeleton` and
`EmptyState` components, adopted on the Quran/Hifz/Community tab landings
so far (Home and More didn't have generic loading/error text to replace;
the remaining ~15 sub-screens are a reasonable next pass, not yet done —
see §6).

**Not yet done from this batch's own plan** (scoped but not started —
genuinely next, not blocked on anything): the remaining visual pass on
sub-screens beyond the 3 tab landings, and the Phase C "Islamic lifestyle
app" expansion (prayer times, qibla compass, dua/azkar, hadith browser,
Hijri calendar) — see §6.

---

## 6. What's genuinely next — and what's blocked on something only the user can do

**Not a backlog in the usual sense** — everything in §5 is done. What's
left falls into two different buckets, and it matters which:

### Buildable now, no external blocker (good candidates for the next session)
- **Backend #10 (assignments)** → unlocks the one remaining piece of F6.
- **Personal mistake-pattern dashboard filters** (e.g. by date range, or a
  "has my accuracy improved over time" trend line) on top of the already-
  shipped Tajweed Coach — a reasonable fast-follow, not a blocker.
- **Khatmah history** (list of past completed/abandoned attempts, not just
  the current one) — `Khatmah` rows for old attempts already exist in the
  DB (see second build batch above), just no endpoint/UI surfaces them yet.
- **Offline tajweed data** in the F7 download pack (currently text-only
  by choice, not blocker — see F7 above).
- **An on-device confirmation pass of the nav restructure specifically**
  (§5 third build batch) — the first on-device pass already happened and
  found/fixed real bugs (§4 items 24, 26-27), but that was against the
  *old* 4-tab structure; the new 5-tab one has only been verified via the
  web harness so far, which already caught and fixed one real safe-area
  bug (§4 item 30) that the web harness itself could easily have missed
  on a different screen. Don't assume the restructure is finger-tested
  until it actually has been.
- **The remaining visual pass**: Skeleton/EmptyState are adopted on 3 of
  5 tab landings (Quran, Hifz, Community) — Home, More, and every one-
  level-deep sub-screen (surah detail, practice, quiz, garden, coach,
  halaqa roster/student, both leaderboards, khatmah detail) still have
  the older plain-text loading/error pattern. Mechanical, bounded work,
  not a design decision — just hasn't been done yet.
- **Phase C — expand into a full Islamic-lifestyle app** (the user's own
  explicit scope decision for this batch, see third build batch above):
  prayer times and qibla compass are both pure client-side calculation
  (no backend) — `adhan` + `expo-location` for prayer times, `expo-sensors`'
  magnetometer + a bearing calculation to the Kaaba for qibla. Hijri
  calendar/Ramadan countdown is similarly client-side. Dua/azkar needs a
  static JSON content dataset bundled in the app (sourcing it is the real
  task, not engineering). Hadith browser is the one piece needing genuine
  new backend/corpus work (mirror `quran_corpus_service.py`'s pattern) —
  do it last, after the cheaper client-side pieces ship.

### Genuinely blocked — needs the user, not more Claude Code time
- **F8 (OS-native integration: widgets, Live Activity, Siri shortcuts)**
  — requires an **EAS development build** (`eas build --profile
  development`), the first point in this whole project where Expo Go
  stops being enough. Still no Mac needed (EAS builds in Expo's cloud),
  but the user needs to actually run the build and install it — Claude
  Code can write all the code but can't trigger/install an EAS build on
  the user's device.
- **F9 (Apple Watch companion)** — watchOS doesn't run React Native at
  all; the watch target needs **actual hand-written Swift/SwiftUI**. This
  is the one item in the whole project where "just write the code" isn't
  enough without someone who can review real Swift.
- **F10 (Android parity + Play Store)** — needs a **real Android device**
  for the WAV-recording-format gap (§4 item 5) to even be diagnosable,
  plus Backend #11/#12/#13 (friends, push, reading plans), none built yet.
- **F11 (Web export, for real)** — the self-testing method in §3 has been
  informally exercising the web target all session, which surfaced real
  gaps a genuine web launch would need to close: `expo-secure-store` has
  no web auth-token persistence at all (falls back to logged-out every
  reload), `expo-file-system`'s File API has no web implementation
  (offline packs and recitation upload wouldn't work on web as shipped),
  and the CORS fix in §4 item 23 is deliberately debug-mode-only — a real
  web production deploy needs an explicit origin allowlist, not a
  wildcard. None of this is a reason not to pursue F11, just the honest
  list of what it would actually need to not be a half-built web
  experience.
- **Camera-to-ayah lookup** (§7 below, feature catalog) — needs
  `react-native-vision-camera`, a native module not included in Expo Go;
  needs a dev build same as F8.
- **Multiple qiraat, word-by-word tap-to-translate, multi-reciter audio
  library** (§7 below) — each needs new corpus data the backend doesn't
  have yet, not a frontend blocker but a backend research/ingestion task
  nobody has started.

---

## 7. The Bigger Feature Catalog (ideas beyond the numbered phases)

Updated this session — hands-free mode moved to "shipped" (§5). What's
left here:

- **Camera-to-ayah lookup**: point the camera at a printed mushaf page,
  on-device OCR (`react-native-vision-camera` + ML Kit/Vision framework)
  extracts the text, feeds it into the same Phase 1 voice-search engine.
  Blocked on a dev build (see §6).
- **Family/kids mode**: simplified scoring, parent dashboard. Backend
  side explicitly deferred too — Phase 6's halaqa teacher/student shape
  already covers the data model a parent/child relationship needs; the
  only new part is a simplified, more playful kid-facing UI.
- Multiple qiraat (recitation styles: Hafs, Warsh, ...) — needs new
  corpus ingestion research, not yet attempted.
- Word-by-word tap-to-translate — needs word-by-word corpus data not yet
  ingested (current corpus is ayah-level only).
- Multi-reciter audio library with waveform-aligned "listen & compare" —
  needs both new audio-serving infra and a corpus source, neither started.

**Explicitly rejected / out of scope, and why** (don't re-propose without
new information):
- Monetization/subscriptions — never asked for, deliberately not designed
  in. RevenueCat would be the standard RN choice if ever wanted.
- Ads — contrary to the spirit of an Islamic education app.

---

## 8. How a New Session Should Start

1. Read this whole file.
2. Check the backend is running (`curl http://localhost:8000/health`) and
   re-verify the current LAN IP matches `IslamQA-app/.env` — **don't
   trust the IP written in §1**, the network has changed multiple times
   already and will again. If backend or Metro aren't running, start them
   per §1's resume block.
3. If the user wants to test on the real device: confirm phone and PC are
   on the same WiFi/hotspot, re-check the port-8000 **and port-8081**
   firewall rules exist (§1 — a new network needs both re-verified, not
   just assumed), and keep doing the **on-device walkthrough** — a first
   pass already happened and found/fixed real bugs (§4 items 24, 26-27),
   but it was against the old 4-tab nav; the new 5-tab restructure (§5
   third build batch) hasn't been finger-tested yet. Expect to find more
   real bugs the web self-testing method in §3 couldn't catch (its own
   known limitations are listed there) — that's expected, not a sign
   something was done wrong.
4. If the user wants to keep building: start from §6's "buildable now"
   list, in whatever order they prefer — none of it is blocked. Use the
   same discipline as every phase before it: verify the real API/library
   behavior first, plan, build, **actually test it** (§3's method, plus
   the real pytest suite for any backend change — currently 228+ tests,
   should stay green), commit when asked. **Before trusting any `tsc`
   route-type error after moving/renaming routes, see §4 items 28-29** —
   it's very likely a stale cache, not a real error.
5. If the user wants F8-F11 or the camera feature: read §6's "genuinely
   blocked" list first and have the conversation about what the user
   needs to do (run an EAS build, get on an Android device, etc.) before
   writing code that can't be tested yet.
