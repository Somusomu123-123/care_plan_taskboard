# Integration & Failure Modes

## Partial failure behaviour

The app loads patients first, then fires one request per patient to get their tasks. These run in parallel:

```ts
const taskResults = await Promise.all(
  patients.map((p) => fetchTasksForPatient(p.id).catch(() => []))
)
```

If one patient's task request fails, their row shows empty. The other patients load fine. The user isn't blocked from using the board.

If the patients request itself fails, the whole board shows an error state with a Retry button.

---

## Optimistic update flow

**Creating a task:**
```
1. Generate a temp id (temp_<timestamp>)
2. Add task to local state immediately — board updates instantly
3. POST to API in background
   ✓ success → swap temp id for real server id
   ✗ failure → remove the task, show error toast
```

**Marking complete:**
```
1. Set task.completed = true and re-derive status locally — card moves to Completed column
2. PATCH to API in background
   ✓ success → replace with confirmed server response
   ✗ failure → restore previous task state, show error toast
```

The user sees the change immediately. If the network fails they see the card snap back and a message explaining what happened.

---

## Handling unexpected API shapes

The backend shapes are intentionally unspecified so the frontend has to be defensive.

| Scenario | What happens |
|---|---|
| `/patients` returns non-array | `if (!Array.isArray(data)) return []` — empty board, no crash |
| Task missing `completed` field | `task.completed ?? false` — treated as not done |
| Task has unrecognised `role` | TypeScript catches at compile time; unknown values render without a role badge |
| Task missing `dueDate` | `deriveStatus` would receive undefined — in practice this would need a server-side validation fix |
| Extra unknown fields in response | Spread into the Task object harmlessly, ignored by the UI |

---

## Adding a new role

Say the team adds a `pharmacist` role.

1. `src/types/task.ts` — add `'pharmacist'` to the `Role` union
2. `src/components/TaskCard.tsx` — add to `ROLE_LABEL` map
3. `src/components/TaskCard.css` — add `.task-card__role--pharmacist` colour
4. `src/pages/Taskboard.tsx` — add to `ROLE_OPTIONS` array for the filter chip

TypeScript will immediately show errors at steps 2 and 3 if you forget them. The board grid, context, API layer, and tests need no changes.

---

## Adding a new task category / type

Currently tasks are free-text titles with no category. If structured task types are needed:

1. Add `taskType: TaskCategory` to `Task` interface
2. Define `type TaskCategory = 'lab' | 'access_check' | 'diet' | 'vaccination' | ...`
3. Add a category filter in `ROLE_OPTIONS` alongside the role filter
4. Render a small type badge on `TaskCard`

The existing filter architecture in `useFilteredTasks.ts` can be extended with a third filter dimension without restructuring anything.

---

## What would break under load

- The mock store is a module-level array. In a real app with concurrent requests this would need proper server state.
- `Promise.all` with one request per patient doesn't scale past ~20 patients. A single `GET /tasks?patientIds=...` endpoint would be better.
- There's no debouncing on the filter chips. With a real API each click would fire a request — would need either debouncing or client-side filtering (which is what we do now).
