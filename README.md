# Care Plan Taskboard

Built for JanoHealth Assignment 3. This is a task management board for dialysis centre staff — nurses, dieticians and social workers can see all patient tasks in one place, filter by their role, and update task status.

---

## Getting started

```bash
git clone https://github.com/Somusomu123-123/care_plan_taskboard.git
cd care_plan_taskboard
npm install
npm run dev
```

Opens at http://localhost:5173

No backend setup needed. The app uses mock data by default so everything works out of the box.

To run tests:
```bash
npm run test
```

---

## What it does

The board shows patients as rows and task status as columns. At a glance you can see which patients have overdue tasks and who needs attention today.

Main features:
- Filter tasks by role — useful if you are a nurse and only want to see your tasks
- Filter by time — overdue, due today, or upcoming
- Add a new task to any patient
- Mark a task as complete — it moves to the completed column instantly without waiting for the server. If the server call fails it rolls back.

---

## Folder structure

```
src/
├── api/          all API calls + mock data lives here
├── types/        TypeScript interfaces for Task and Patient
├── hooks/        state management and utility hooks
├── components/   TaskCard, NewTaskModal, Toast
└── pages/        Taskboard — the main page
```

I kept the API layer separate from components so when a real backend is ready I only need to change files in src/api/ and nothing else breaks.

---

## Why Context and useReducer

I looked at three options:

React Query — good for caching and syncing server data but I needed full control over the optimistic update and rollback. With React Query the rollback happens inside onMutate/onError callbacks and it felt like the logic was hidden. I wanted to see exactly what happens in each failure case.

Redux — works fine but felt like too much setup for one feature. Slices, selectors, action creators — a lot of files for a single domain.

Context + useReducer — I went with this because the reducer makes every state change explicit. When a task creation fails I can see exactly which action fires and what state it produces. It also made the tests straightforward to write.

The tradeoff is that every context consumer re-renders on any state change. For 5 patients and 20 tasks that is fine. For a bigger dataset I would split it into a tasks context and a UI/filter context.

---

## Data decisions

The API shapes were left open in the spec so I had to define them myself.

For dueDate I chose a plain YYYY-MM-DD string instead of a full timestamp. Dialysis tasks are date based not time based and using a timestamp caused a timezone issue — a task due "today" in one timezone was showing as "yesterday" in UTC. Storing just the date and comparing at local midnight fixed that.

I kept status out of the stored data entirely. Instead of storing "overdue" on the server I calculate it fresh every time by comparing dueDate to today. This means the board is always accurate — a task that was "upcoming" last week automatically becomes "overdue" today without any background job or manual update.

role is a union type not an enum. Adding a new role means one line change in types/task.ts and TypeScript will show errors everywhere that needs updating.

---

## Assumptions I made

- No login or authentication. The spec did not mention it so I treated role filtering as a view preference not a permission system.

- Recurring tasks are out of scope. The scenario mentions them but there is no recurrence model defined. All tasks are one-off instances for now.

- The mock data uses March 2026 dates so overdue/today/upcoming statuses are meaningful when you run the app.

- I assumed the backend would have separate endpoints per patient for tasks rather than one big endpoint. This matches the spec but means N+1 requests on load. For a real app I would ask the backend team for a bulk endpoint.

---

## What I would improve with more time

- Add retry with backoff when an API call fails instead of immediately showing an error
- The date picker in the modal is the browser default which looks different on every browser
- No way to edit a task after creating it — only mark complete
- No overflow handling when a patient has many tasks in one column
- Would add MSW for more realistic mock network simulation

---

## Seed data

Mock patients and tasks are in src/api/mockData.ts. They load automatically when you start the app — no script or database needed. Refresh the page to reset any changes since the mock store is in memory.

There are 5 patients with 19 tasks spread across all roles and all four status states so the board is populated on first load.

---

## AI usage

I used Claude during this project mostly for boilerplate and to talk through architecture decisions.

What I used it for:
- The initial reducer setup and action types
- Dark theme CSS colour values
- Talking through whether to use React Query or Context for the optimistic update

What I changed manually:
- The date parsing logic. The AI used new Date(isoString) which has timezone offset problems on some systems. I rewrote it to parse year, month, day separately and build a local midnight date.
- Removed a 10% random failure rate the AI added to the mock createTask function. It made sense for testing but would look broken during a demo.
- Moved TaskboardContext into the hooks folder. The AI kept creating a separate context folder which did not match my project structure.

Where I disagreed with the AI:
It suggested Promise.allSettled when loading tasks for all patients so you could tell the difference between an empty patient and a failed fetch. I kept Promise.all with .catch(() => []) instead. From the user's perspective both look the same on the board — an empty row. Adding allSettled would complicate the code without changing anything the user actually sees.