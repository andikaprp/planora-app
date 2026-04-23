# Planora build plan

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

