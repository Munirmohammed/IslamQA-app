# IslamQA / Quran App — Project Handoff

**Read this whole file before doing anything.** This is the single source of
truth for a new Claude Code session picking up this project cold. It covers
the vision, everything already built, everything planned, every real bug
already found and fixed (so they don't get rediscovered), and exactly how to
resume.

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
  tafsir). **7 phases shipped, fully tested.**
- **Frontend** (`C:\Users\yeabs\Desktop\me\IslamQA-app`, GitHub:
  `Munirmohammed/IslamQA-app`) — React Native + Expo, iOS first (the user's
  own iPhone is the test device), then Android, then web, all from one
  codebase. **F0 and F1 shipped.**

The user's own words on ambition: *"use all our advanced backend systems and
also add more features that we cant even imagine of ... that are not
currently existing and are very advanced and hard to do."* Every phase below
was planned with that bar in mind — real, verified, novel features, not
padding.

**Working style established across this whole project (follow it exactly):**
1. Before building on any external API/library, **verify it for real**
   (curl it, read its actual response shape, check actual version/package
   availability) — don't assume from training knowledge, which is often
   stale by the time you're building. This caught real bugs every single
   phase (see §4).
2. For anything non-trivial, write a short plan (context, what's being
   built, why, what's deferred and why) and get it approved before writing
   code. Keep plans honest: explicitly say what's *not* being built and why
   (e.g. "real audio-liveness anti-cheat needs dedicated audio-ML research,
   not attempted here — a narrow duplicate-hash check is, and is labeled as
   such").
3. Ship one complete, demoable vertical slice at a time. Test it for real
   (full test suite for backend; typecheck + `expo export` bundle check for
   frontend, since there's no device in this dev loop by default). Commit.
   Push. Then move to the next slice.
4. Never fake a feature to look more finished than it is. If something is
   genuinely hard (on-device ASR, Apple Watch, real anti-cheat), say so
   plainly and defer it rather than building a shallow version that implies
   more than it delivers.

---

## 1. Current State (exactly where things stopped)

- Backend is **running locally** on this machine, port 8000
  (`python -m uvicorn app.main:app --host 0.0.0.0 --port 8000` from the
  `IslamQA` repo root, venv at `IslamQA\.venv`).
- **The phone can't reach the backend over plain LAN**: this machine's WiFi
  network is categorized as Windows "Public" profile, and there's no
  firewall allow-rule for this project's specific venv python.exe (only for
  a couple of *other* Python installs on this machine) — Claude doesn't have
  admin rights to add one. **Workaround in place: ngrok.** An ngrok tunnel
  is already authenticated on this machine and was running at
  `https://siamese-kinetic-smolder.ngrok-free.dev` (a free ngrok tunnel URL
  — it will have changed/died by the time you read this; restart with
  `ngrok http 8000` and copy the new `https://...ngrok-free.dev` URL).
- `IslamQA-app/.env` holds `EXPO_PUBLIC_API_URL=<that tunnel URL>` — **update
  it** when the tunnel URL changes (ngrok free tier URLs are not stable
  across restarts).
- **Real-device testing has started** (as of a parallel session that ran
  alongside this one): the app has been opened in Expo Go on the user's
  iPhone for the first time, which immediately surfaced three real bugs
  now fixed — see §4 items 10-12 (ASR/search blocking the event loop,
  `create_tables()` missing from real app startup, and the FormData upload
  incompatibility). The app also now has a real identity: **"Qalam"** (قلم,
  "pen"), with a bespoke animated SVG launch sequence
  (`src/components/launch-animation.tsx`) replacing the generic Expo
  template splash. **Still not confirmed**: a full, successful end-to-end
  walkthrough (browse → auth → record a recitation → see mistakes
  highlighted) with no further bugs. Keep testing from here.
- Real alternative fix for the LAN issue, if revisited: either (a) the user
  manually flips their WiFi network to "Private" in Windows Settings (a
  plain user-level toggle, no admin needed, usually), or (b) run an elevated
  PowerShell once: `New-NetFirewallRule -DisplayName "IslamQA backend" -Direction Inbound -Action Allow -Program "C:\Users\yeabs\Desktop\me\IslamQA\.venv\Scripts\python.exe" -Protocol TCP -LocalPort 8000 -Profile Any`.
  Either removes the need for ngrok entirely for same-network testing.

### To resume right now:
```powershell
# Terminal 1 — backend
cd C:\Users\yeabs\Desktop\me\IslamQA
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Terminal 2 — tunnel (until the firewall/network-profile issue above is fixed properly)
ngrok http 8000
# copy the https://....ngrok-free.dev URL it prints

# Update IslamQA-app/.env:
# EXPO_PUBLIC_API_URL=https://<that-url>

# Terminal 3 — frontend
cd C:\Users\yeabs\Desktop\me\IslamQA-app
npm install   # if not already done
npm start
# scan the QR code with Expo Go on the iPhone
```

---

## 2. Backend — Phases 1-7 (all shipped, 173 tests passing)

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
| 3 | Gamification | Streaks, hasanat (reward count — real hadith-based 10x-per-letter, not an arbitrary score), global leaderboard. | `gamification_service.py` |
| 4 | Memorization (Hifz) | Standard SM-2 spaced repetition, gradeable directly *or* derived from a Phase 2 mistake count. Mutashabihat (confusable-verse) lookup reuses Phase 1's search engine with zero new infra. | `srs_service.py` |
| 5 | Tajweed annotation | Which letters carry which tajweed rule (qalqalah, madd, idgham, ikhfa...), sourced from Quran.com's own tajweed-coloring API. | `tajweed_service.py` |
| 6 | Halaqa/teacher mode | Teacher creates a circle, students join by code, teacher reviews recitation history. Also finally persists Phase 2's recitation checks to the DB (`RecitationSession`/`MistakeLog`), deliberately deferred until this phase needed it. | `halaqa_service.py` |
| 7 | Tafsir lookup + search | Real Quranic exegesis (Ibn Kathir Abridged, English) per ayah, plus free-text search over the whole tafsir corpus using the same Phase 1 retrieval pattern. | `tafsir_service.py`, `tafsir_search_service.py` |
| 8 | Quran content/browse API | Plain `GET /quran/surahs` + `GET /quran/{surah}` — the Mushaf-reading endpoint none of the above needed until the frontend did. | `endpoints/quran.py` |

**Deliberately *not* built, and why (don't silently try to "complete" these
without re-reading the reasoning — they were skipped on purpose):**
- Real audio-liveness anti-cheat (detecting playback vs. live mic) — needs
  dedicated audio-ML research. What *is* built instead: an honestly-labeled
  duplicate-audio-hash flag (same file submitted by two different accounts).
- Acoustic tajweed scoring (measuring actual madd duration/ghunnah from
  audio) — same research-grade category, deferred.
- Apple Watch, true on-device offline ASR — see frontend catalog, same
  treatment.

### Backend #9-13 (planned, not yet built — pull forward exactly when the
frontend phase needing them starts):
- **#9 Mistake-pattern analytics** — aggregate Phase 6's persisted
  `MistakeLog` data: "this user most often misses qalqalah on ق." Needed
  for the frontend's "Tajweed Coach" (F4).
- **#10 Assignments** — teacher assigns an ayah range + due date in a
  halaqa; student's matching `RecitationSession`s auto-satisfy it. Needed
  for F6.
- **#11 Social graph** — `FriendRequest`/`Friendship` + a `scope=friends`
  leaderboard option (Phase 3's leaderboard is global-only right now).
  Needed for F10.
- **#12 Push notifications** — device token registration + a
  dispatch service (Expo's push service brokers both APNs and FCM from one
  API). Nothing like this exists yet. Needed for F10.
- **#13 Reading plans** — structured multi-day plans ("Quran in Ramadan")
  scheduling `gamification.log_progress` targets — generalizes Phase 3's
  deferred "challenges." Needed for F10.

---

## 3. Frontend — Tech Decisions (confirmed with user, don't re-litigate)

- **React Native + Expo**, not native Swift/Kotlin, not Flutter. One
  codebase → iOS + Android + (Expo web export) web.
- **No Mac needed, ever.** EAS Build (Expo's cloud build service) compiles
  signed iOS binaries on Expo-hosted macOS workers. The user has no Mac
  (a friend does, as a fallback only, never required). Expo Go (free App
  Store app) is how the iPhone runs the app during early development with
  zero native build step at all.
- Expo SDK 57 (stable; 58 was still beta at scaffold time — check if it's
  stable now and consider upgrading), React Native 0.86-ish, **New
  Architecture mandatory** (Fabric/TurboModules, not optional since SDK 55).
  TypeScript. Expo Router (file-based, `src/app/`).
- **State**: TanStack Query (all server state) + Zustand (client state
  only — theme, the access token). This split is deliberate; don't
  reintroduce a Redux-style "copy API data into a global store" pattern.
- **Audio**: `expo-audio`, not the deprecated `expo-av`. See §4 for the
  critical WAV-format gotcha.
- Path alias `@/` → `src/`. Repo root has its own `package.json`, fully
  separate from the Python backend (sibling folder, separate git history,
  separate GitHub repo).

---

## 4. Real bugs/gotchas already found and fixed — DO NOT REDISCOVER THESE

This project's whole discipline has been "verify before building," and it
paid off constantly. Read this section before touching the corresponding
area again.

1. **Basmalah embedded in ayah 1 text** (alquran.cloud's `quran-uthmani`
   edition prefixes every surah's ayah 1 — except Al-Fatiha and At-Tawbah —
   with the Basmalah, which would make a correct recitation of just the
   ayah register as "missing a word"). Fixed in `quran_corpus_service.py`
   by splitting it into its own `basmalah` field, detected robustly via the
   diacritic-free `simple` text rather than a fragile literal Uthmani
   string match. **Quran.com's tajweed/tafsir APIs do NOT have this bug**
   (independently verified) — don't assume it applies everywhere.
2. **Whisper `generate()` gotcha**: do not pass `language=`/`task=` kwargs
   to `tarteel-ai/whisper-base-ar-quran`'s `.generate()` — newer
   `transformers` raises "generation config is outdated" against this
   checkpoint's `generation_config.json`. Calling `generate()` with no
   language/task args at all works correctly (the checkpoint is Quran-only
   anyway).
3. **Tajweed/tafsir API pagination**: `api.quran.com`'s tafsir `by_chapter`
   endpoint silently paginates at 10 ayahs/page for long surahs (Al-Baqara
   got truncated to 10/286 ayahs before this was caught). Fix:
   `per_page=300` query param (covers even the longest surah in one
   request). The tajweed `uthmani_tajweed` endpoint does NOT paginate —
   confirmed separately, don't assume the same fix is needed there.
4. **Tafsir text is shared across grouped ayahs**: Ibn Kathir's commentary
   is often written once for several consecutive ayahs (e.g. all of Surah
   112 shares one block). The API returns one entry per ayah but only the
   *first* ayah of a group has non-empty text; the rest are empty strings.
   `tafsir_service.py`'s `_build_blocks_for_chapter` tracks this as
   `(ayah_from, ayah_to)` ranges so every ayah in a group resolves to the
   shared text, not emptiness.
5. **Audio format for recitation upload**: the backend decodes audio via
   `soundfile`/libsndfile, which handles WAV/MP3/FLAC/OGG but NOT
   AAC/M4A (expo-audio's default recording presets!) and NOT WebM/Opus
   (what browser `MediaRecorder` and Android's recorder most naturally
   produce). The frontend's `RECITATION_RECORDING_OPTIONS`
   (`src/lib/audio-recording-options.ts`) forces WAV/LINEARPCM output on
   iOS specifically. **Android has no raw-PCM/WAV option in expo-audio's
   `AndroidOutputFormat` enum at all** — Android recordings will NOT be
   server-decodable until either a client-side transcode step is added or
   the backend's accepted formats are extended. This is a known, flagged
   gap for the Android-parity phase (F10), not an oversight.
6. **Arabic combining-mark transcription risk**: don't hand-type Arabic
   literal strings as test expectations (e.g. "احد" vs. the linguistically
   correct "أحد" — easy to mistype the hamza). Caught this exact mistake
   twice. Prefer deriving expected values from the real corpus/fixture data
   directly in the test rather than retyping Arabic by hand.
7. **Test isolation**: the test suite's DB is a real, *shared, persistent*
   SQLite file across the whole pytest session (see `tests/conftest.py`) —
   not reset between tests. Any test creating a `User` needs a unique
   username/email per invocation (`uuid.uuid4().hex[:8]` suffix pattern
   used throughout `test_gamification_*`, `test_halaqa_*`, etc.), and any
   test building a search index must redirect its persistence path to a
   `tmp_path` fixture, not the real `data/quran/*.pkl` files (a fixture
   corpus test once clobbered the real production BM25 index this way).
8. **CRLF line-ending corruption**: editing `app/main.py` and
   `app/core/database.py` with the Edit tool once converted them from LF to
   CRLF, producing a noisy whole-file diff. Normalize with a quick Python
   `.replace(b'\r\n', b'\n')` pass and re-check `git diff --stat` before
   committing if a diff looks suspiciously large for a small change.
9. **expo-audio recording presets default to M4A/AAC** — see #5. Also:
   `expo-av` is fully removed from Expo Go as of SDK 55; always use
   `expo-audio`.
10. **CPU-bound work inside `async def` doesn't yield to the event loop by
    itself.** `check_recitation`'s Whisper transcription and
    `VoiceSearchService.search`'s FAISS/BM25/rerank work are both plain
    synchronous calls — being inside an `async def` function does nothing
    on its own; without an explicit `await asyncio.to_thread(...)`, one
    slow request blocks every other in-flight request (even unrelated ones
    like `/health`) for its full duration. Fixed in both places. **Check
    for this same pattern before adding more synchronous-but-slow backend
    work** (tajweed/tafsir lookups are cheap enough not to matter; a future
    heavy call might not be).
11. **`create_tables()` was never called from real app startup** — only
    from test fixtures (`tests/conftest.py`) and the one-off seed script.
    `app/main.py`'s lifespan now calls it (idempotent, `CREATE TABLE IF NOT
    EXISTS` semantics, safe on every startup) before initializing services.
    Before this fix, every table added from Phase 3 onward
    (`UserStreak`, `MemorizationCard`, `RecitationSession`, `Halaqa`, ...)
    silently didn't exist in a real (non-test) run of the app.
12. **React Native's classic FormData `{uri, name, type}` file shape
    doesn't work with Expo SDK 57's `fetch` polyfill at all** — it throws
    "Unsupported FormDataPart implementation" (the polyfill's
    `convertFormData.ts` only accepts a real Blob/File-like value with a
    `.bytes()` method). `src/lib/api-client.ts`'s `apiUpload` now uses
    `expo-file-system`'s `File#upload()` (`UploadType.MULTIPART`) instead
    of `fetch` + `FormData` for the recitation-check upload — it bypasses
    `fetch` entirely for that one call. If any future feature needs another
    file upload, reuse `apiUpload`, don't reintroduce raw FormData.

---

## 5. Frontend Roadmap — F0 through F11

Numbered independently from the backend's phases (frontend phases use an
"F" prefix). **F0 and F1 are shipped.** Everything else is planned, not
built.

### F0 — Foundation ✅ SHIPPED
Project scaffold (Expo Router, TypeScript), design system (color tokens in
`src/constants/theme.ts`, including an Arabic type scale kept deliberately
separate from the Latin one — Quran text needs larger size/line-height),
Arabic font (Noto Naskh Arabic — a real Uthmani-script font like KFGQPC
would read more authentically but isn't on Google Fonts, flagged as a later
polish item), TanStack Query + Zustand setup, typed API client
(`src/lib/api-client.ts`) with auth token injection, auth screens (login/
register against the backend's existing `/auth` endpoints,
`expo-secure-store`-backed token persistence), 3-tab nav shell (Home, Read,
Profile), read-only Mushaf reader (surah list → surah detail via
`FlashList`, backed by Backend #8).

### F1 — Voice & Recitation Core ✅ SHIPPED
4th tab added ("Practice"). Two modes on one screen
(`src/app/practice.tsx`): no params = "Tasmeea" (recite any fragment, the
backend transcribes + searches for the matching ayah); `?surah=&ayah=` =
practice that specific ayah directly (reachable via a "Check my recitation"
mic button added to every `AyahCard` in the reader). Recording via
`expo-audio` with the WAV-format fix from §4. Mistakes rendered as colored/
struck-through inline spans directly on the ayah's own Uthmani text
(`src/components/mistake-highlighted-text.tsx`) — not a separate list, the
actual word highlighted in place.

### F2 — Gamification (not started)
Streak/hasanat dashboard (animated flame, particle-burst counter on
earning hasanat), calendar heatmap of activity, global leaderboard screen.
Plus two genuinely novel pieces from the feature catalog:
- **"Hifz Garden"**: a tree/garden that visibly grows — new leaves/branches
  per surah memorized, blooms per completed juz. Replaces a flat progress
  bar with something that feels like tending something real. No existing
  Quran app does this.
- **Shareable ayah cards**: one-tap, auto-generate a beautiful, branded,
  Instagram-story-sized image from any ayah + translation (optionally +
  "Day 47 of my streak"). The single highest-leverage, lowest-effort growth
  feature available — every competitor gates this behind manual
  screenshotting. Needs an image-generation approach client-side (e.g.
  `react-native-view-shot` to snapshot a styled component, or a
  canvas-based renderer) — not yet researched/chosen.

### F3 — Memorization (Hifz) UI (not started)
Swipe-to-grade SRS review cards (Phase 4's backend), auto-graded by default
when a review is done via a live recitation check rather than manual
self-rating (mistake count → SM-2 quality is already how the backend API
works — the UI should default to this path). **Mutashabihat confusion
quiz**: side-by-side "which of these two ayahs is actually 2:255 vs. its
near-twin" drills, generated from Phase 4's `similar` endpoint. Per-ayah
weak-point heatmap once Backend #9 exists.

### F4 — Tajweed-Colored Reader + Tajweed Coach (not started)
Tap a tajweed-colored letter in the Mushaf reader → popover with the rule
name/description (Phase 5's data, already structured for exactly this).
**Tajweed Coach**: once there's enough recitation-check history, a
dashboard surfacing real personalized patterns ("you most often miss
qalqalah on ق") — needs Backend #9 (mistake-pattern aggregation; doesn't
exist yet, the raw `MistakeLog` data it would aggregate already does).

### F5 — Tafsir & "Ask the Quran" (not started)
"Explain this ayah" panel (direct Phase 7 lookup) + a free-text search
screen styled as a focused Q&A UI — **explicitly retrieval, not a chat
bot**, and the UI should say so (cite the real Ibn Kathir passage it
found). This is a deliberate, documented deviation from the original
roadmap sketch, which suggested routing through the backend's older
`hybrid_ai_service.py`/`simple_ai_service.py` — those were read in full and
found to be built on largely-retired free Hugging Face conversational
model endpoints with keyword-template fallbacks, not a solid foundation.
Don't revisit that decision without re-reading why.

### F6 — Halaqa/Teacher Mode (not started)
Teacher dashboard: roster, per-student stats, drill into full mistake
detail per session (Phase 6's data, already there). Assign homework once
Backend #10 exists. "Listen in" live mode during a student's recitation,
reusing the backend's existing WebSocket infra (`app/websocket/`) rather
than inventing a new transport — the one place this app needs true
realtime.

### F7 — Offline Packs (not started)
Download a surah/juz "pack" (text + audio + tajweed data) for offline
reading/listening/browsing — everything involved is static data already
served by existing endpoints, this is purely a client-side caching/
download-manager problem. **Offline recitation-check is explicitly NOT
attempted** — would need an on-device ASR model (e.g. CoreML-converted
Whisper-tiny), a real accuracy/latency trade-off against the server-side
model already validated in Phase 2. Flagged as a distant research stretch,
not promised to the user as a real roadmap item.

### F8 — OS-Native Integration (not started, iOS-first)
Requires moving from Expo Go to an EAS "development build" for the first
time (still built in Expo's cloud, no Mac needed, but no longer runnable
inside plain Expo Go). Verified against the real Oct-2026 Expo ecosystem:
- **Home screen widget**: streak + due SRS reviews + ayah of the day, via
  Expo's official `expo-widgets` (alpha as of this writing — re-check its
  maturity before committing to it) — React-component widgets, no separate
  Xcode target needed.
- **Live Activity / Dynamic Island**: an active recitation session shown
  live (mistake count ticking) on the Lock Screen/Dynamic Island. Either
  `expo-widgets`' built-in Live Activities support, or
  `react-native-live-activity-kit` as the actively-maintained standalone
  fallback (note: `expo-live-activity` specifically was archived/deprecated
  as of mid-2026 — don't use it).
- **Siri / App Intents / Shortcuts**: "Hey Siri, check my Quran streak" —
  via Expo's official `expo-app-intents` (new as of SDK 58), Swift defined
  through a config plugin + an "inline modules" experiment, no full native
  eject required.
- Android equivalents (widgets, notifications) ship in F10, not here —
  Android has no Live Activities/App Intents analogue, that's a platform
  reality, not a gap to fill.

### F9 — Apple Watch Companion (stretch, not started)
Tap-to-mark-read + streak glance + haptic dhikr counter. **Real hard
limitation, confirmed via research**: React Native does not run on
watchOS at all. The watch target must be actual hand-written Swift/
SwiftUI, scaffolded via Expo Apple Targets/`expo-watch` (keeps it inside
the Expo-managed project without a full eject) and bridged to the phone
app over WatchConnectivity. This is the one item in the whole catalog
where "just write the code" isn't enough without someone who can review
real Swift. Flagged honestly as later/higher-effort, same treatment the
backend gave acoustic tajweed scoring and real anti-cheat — don't attempt
to fake a shortcut here.

### F10 — Android Parity Pass + Play Store Submission (not started)
By this point the app has technically been running on Android the whole
time (same RN codebase) — this phase is dedicated Android-specific QA,
real-device testing, the WAV-recording-format gap from §4 point 5, tab bar
icons (F0 only built iOS SF Symbol icons, Android needs real drawable
resources — not guessed at, deferred here on purpose), and the Play Store
listing itself. Needs Backend #11 (friends), #12 (push), #13 (reading
plans) as they come up in this phase.

### F11 — Web Export (not started)
Expo's web target — the "and others" platform from the original ask,
close to free given everything above was built RN-first with web export
in mind from the start (`react-native-web` is already in F0's
dependencies).

---

## 6. The Bigger Feature Catalog (ideas beyond the numbered phases)

These came out of the "think of features that don't even exist yet"
brief. Some are folded into the phases above; the rest are genuinely
unscheduled but worth remembering so a future session doesn't have to
re-brainstorm from zero:

- **Camera-to-ayah lookup**: point the camera at a printed mushaf page,
  on-device OCR (`react-native-vision-camera` + ML Kit/Vision framework —
  confirmed to handle Arabic script) extracts the text, feeds it into the
  *same* Phase 1 voice-search engine as a text query instead of an ASR
  transcript. Nobody else does this. Not yet scheduled into a specific F
  phase — candidate for F4 or a new phase alongside it.
- **Hands-free continuous practice mode**: mic stays open across an entire
  session, auto-advances ayah-by-ayah as each is correctly recited, reads
  mistakes aloud via TTS instead of requiring the user to look at the
  screen. Built for memorization drilling without holding the phone. Not
  in Tarteel or Quranly today. Natural extension of F1/F3.
- **Family/kids mode**: simplified scoring, parent dashboard. Explicitly
  deferred on the backend side too (Phase 6's halaqa teacher/student
  relational shape covers the exact same data model a parent/child
  relationship needs — the only new part is a simplified, more playful
  kid-facing UI, a frontend-only concern).
- Multiple qiraat (recitation styles: Hafs, Warsh, ...) — rare in consumer
  apps, would differentiate hard, needs new corpus ingestion research
  (not yet attempted — unclear if a reliable open API source exists the
  way alquran.cloud/quran.com covered Hafs).
- Word-by-word tap-to-translate in the reader — needs word-by-word corpus
  data not yet ingested (Phase 1's corpus is ayah-level only). Same
  alquran.cloud/quran.com API family likely has this; not yet verified.
- Multi-reciter audio library with waveform-aligned "listen & compare"
  against the user's own recitation.

**Explicitly rejected / out of scope, and why** (don't re-propose without
new information):
- Monetization/subscriptions — never asked for, deliberately not designed
  in, to avoid scope creep on an already-massive roadmap. If ever wanted,
  RevenueCat is the standard RN choice, flagged here only as a pointer.
- Ads — contrary to the spirit of an Islamic education app; not considered.

---

## 7. How a New Session Should Start

1. Read this whole file.
2. Check whether the backend is already running (`curl http://localhost:8000/health`
   from a shell with access to this machine) and whether the ngrok tunnel
   in `IslamQA-app/.env` is still alive. If not, restart both per §1.
3. If the user says "continue the plan," the next concrete action is:
   **actually run the app on the iPhone via Expo Go and confirm F0+F1 work
   end-to-end for real** (never yet done) — browse the Quran, log in/
   register, record a recitation and see mistakes highlighted. Fix whatever
   breaks on a real device (this is the first time anything in this project
   has run outside a bundler/typecheck dry-run).
4. Only after that real-device confirmation, move to F2 (gamification UI),
   following the same discipline as every phase before it: plan → verify →
   build → test → commit → push.
5. For backend additions (#9-13), use the `Agent`/plan-mode workflow the
   same way Phases 1-8 were built: research the real need, write a short
   plan, get it approved, implement, run the *full* test suite (`pytest
   tests/ -q` from `IslamQA/`, currently 173 tests, should stay green),
   commit, push.
