# ClassEvent Schema Modification

## Goal Description
Modify `class_events` table to use `classId` as the Primary Key and remove the auto-incrementing `id` column.

## User Review Required
> [!WARNING]
> **One Event Per Class Limit**: By making `classId` the Primary Key, each class can only have **one** event record in this table. Attempting to add a second event for the same class will fail or overwrite the first.
> **No Global Events**: Primary Keys cannot be null. Events must be associated with a specific class.

## Proposed Changes

### Backend [backend]
#### [MODIFY] [models/ClassEvent.js](file:///c:/Users/MUKISA%20INNOCENT/Music/Tudduke-Okufa/backend/models/ClassEvent.js)
- Remove `id` field.
- Update `classId`: set `primaryKey: true`, `allowNull: false`, `unique: true`.

#### [MODIFY] [server.js](file:///c:/Users/MUKISA%20INNOCENT/Music/Tudduke-Okufa/backend/server.js)
- `POST /api/teacher/schedule`: Require `classId`. Validate it is not null.
- `GET /api/kids/schedule`: Update logic if it relied on global events (now it must likely fetch all class events or specific ones).

## Verification Plan

### Automated Verification
- Create `scripts/test-event-schema.js`:
    - Create a class.
    - Create an event for that class (Should Succeed).
    - Try to create a second event for same class (Should Fail or Update).
    - Try to create event without classId (Should Fail).
