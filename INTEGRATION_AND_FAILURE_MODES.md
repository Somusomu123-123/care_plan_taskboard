# Integration and Failure Modes

---

## How the app loads data

On startup it fetches all patients first, then fires one request per patient to get their tasks in parallel:

```ts
const taskResults = await Promise.all(
  patients.map((p) => fetchTasksForPatient(p.id).catch(() => []))
)
```

The .catch(() => []) on each patient means if one fails the rest still load. That patient just shows an empty row. The whole board does not break because one request failed.

If the patients request itself fails the board shows an error message with a Retry button.

---

## Optimistic update and rollback

When you mark a task complete:

1. Save a snapshot of the current task
2. Update local state immediately — card moves to Completed column
3. Send PATCH request to the server
4. If it works — replace with confirmed server response
5. If it fails — restore the snapshot, show red error toast

Same pattern for creating a task. It appears on the board instantly with a temp id. When the server responds the temp id gets replaced with the real one. If the server fails the task disappears and you see an error.

This means the UI always feels fast. The user does not wait for the server before seeing feedback.

---

## Handling bad API responses

The spec said the backend might return unexpected shapes. A few things we handle:

If /patients returns something that is not an array:
```ts
if (!Array.isArray(data)) return [];
```
Returns empty list instead of crashing.

If a task is missing the completed field:
```ts
completed: task.completed ?? false
```
Defaults to false instead of undefined.

If the response has extra fields we did not expect — they get spread into the object and the UI ignores them. No crash.

If dueDate is missing — deriveStatus would fail. This is something the backend should prevent. The frontend cannot safely guess a due date.

---

## Network failures

Currently when a request fails it rolls back immediately and shows an error toast. There is no retry.

What I would add: retry with exponential backoff — try once, wait 1 second, try again, wait 2 seconds, try once more, then rollback. This would handle temporary network blips without the user seeing an error at all.

---

## Adding a new role

Say the team adds a pharmacist.

1. Add 'pharmacist' to the Role union in src/types/task.ts
2. TypeScript immediately shows errors in TaskCard.tsx at the ROLE_LABEL map — add the label
3. Add a CSS class for the badge colour in TaskCard.css
4. Add a filter button in BoardFilters.tsx ROLE_OPTIONS array

Nothing else needs to change. The board grid, context, reducer, API layer and tests are all role-agnostic. TypeScript does the work of finding every place that needs updating.

---

## Adding a new task category

Tasks currently just have a free text title. If structured categories are needed like lab, access_check, vaccination:

1. Add taskType to the Task interface
2. Define a TaskCategory union type
3. Add a category filter in BoardFilters
4. Show a badge on TaskCard

The filter logic in useFilteredTasks already handles multiple dimensions so adding a third filter is straightforward.

---

## Things that would not scale

The app loads tasks per patient with one request each. For 5 patients that is 5 requests. For 100 patients that is 100 requests on every page load. A bulk endpoint like GET /tasks?patientIds=p1,p2,p3 would be much better.

The mock and server data is in memory. Concurrent requests or server restarts reset everything. A real app needs a database.

The board has no pagination or virtualisation. With 100 patients and many tasks per patient the DOM would get large and scrolling would feel slow. TanStack Virtual would fix this.