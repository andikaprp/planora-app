# Product bible

## Product scope (MVP)
- Onboarding
- Login / Register
- Home
- Subjects
- To-do
- Schedule (weekly timetable)
- Flashcards
- Profile

## Figma references
File key: `c45JUG4Vf6JSFgmo9aXMul`

- **Onboarding**: node `161:2055`
- **Login/Register**: node `812:26434`
- **Homepage**: node `127:1332`
- **Flashcard**: node `161:2057`
- **To-do**: node `199:15982`
- **Schedule**: node `265:15164`
- **Subject**: node `491:25567`
- **Profile**: node `597:22574`

## Stack
- React Native + Expo
- Expo Router
- Supabase (Auth + Postgres + Storage)
- Offline-first local cache: SQLite (schema + migrations from day 1)
- Media: file storage + image picker (optional for flashcards)

## Data model (minimal)
- `subjects(id, name, color, sortOrder, createdAt, updatedAt)`
- `todos(id, subjectId, title, notes, dueAt, completedAt, priority, createdAt, updatedAt)`
- `timetable_slots(id, dayOfWeek, startTime, endTime, subjectId, location, notes, sortOrder)`
- `flashcard_decks(id, subjectId, name, createdAt, updatedAt)`
- `flashcards(id, deckId, front, back, createdAt, updatedAt)`
- `review_state(cardId, ease, intervalDays, dueAt, lastReviewedAt)` (optional)
- `attachments(id, ownerType, ownerId, uri, type, createdAt)` (optional)

## Execution plan
- **Auth**
  - Supabase email/password auth
  - Persist session securely (SecureStore)
- **Core navigation**
  - Onboarding → Auth → Tabs
- **Local persistence**
  - SQLite schema + migrations
  - Repositories for subjects/todos/timetable/flashcards
- **Sync (offline-first)**
  - Local-first reads
  - Queue mutations + background sync
  - Conflict strategy (start with last-write-wins, refine per entity if needed)
- **Backup/restore**
  - Export/import local data (optional early, recommended before beta)

## Test plan
- Create account / login / logout
- App restart keeps session
- Local CRUD for subjects/todos/timetable/decks/cards
- Offline mode usable (read/write queued) then sync on reconnect

## Membership card
- Copy: "Member of Rancana Premium" (was "Member of Rancana") for exclusivity.

## Achievements and badges
- In-app achievements and badges that can be shared with others.

## Group study mode (Premium)
- Users can create a small study group (example: four people) and do study mode together.
- Premium only.

## Study influencers (later)
- Later collaboration with study influencers.
- Add their profiles in the app so students can contact them easily to help arrange their work.

## Future features (Nila take, 2026-08-22)
- Keep: shared flashcard decks inside a group (extends shipping flashcards; study-together without a shared deck is just chat).
- Keep: focus timer that mints a shareable badge, only if it mints from the existing live timer/widget, not a new focus mode. Badge proves a session (subject + minutes), not a sticker.
- Last: Premium card copy ("Member of Rancana Premium") only if a shareable member card already exists. Cheap, cosmetic.
- Later / drop: influencer profiles as a contact directory until they can drop a deck or a week plan.
- Later / drop: generic achievement catalog not tied to a real study action (finish a deck, hit a tugas deadline, finish a timer).
- Later / drop: group as hangout or live multiplayer. Four people sharing one deck + one tugas deadline is enough of a group.
- Add: name what Premium unlocks (SKUs planora_premium / planora_premium_plus exist; the gate is still unnamed) before adding more Premium-only surfaces.
- Hard part: local-first cannot do group/share without cloud. That is a V2 server decision, not a feature. Do not start group until Andika accepts some cloud.
