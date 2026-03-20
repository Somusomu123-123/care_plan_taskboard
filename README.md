# Care Plan Taskboard

This is my submission for JanoHealth Assignment 3. It is a task management board for dialysis centre staff. The idea is that nurses, dieticians and social workers all work with the same patients but need to see their own tasks quickly without going through everything.

---

## Getting started

```bash
git clone https://github.com/Somusomu123-123/care_plan_taskboard.git
cd care_plan_taskboard
npm install
```

Copy the environment file:
```bash
cp .env.example .env
```

Start the backend (open a new terminal):
```bash
cd server
npm install
npm run dev
```

Start the frontend (in another terminal):
```bash
npm run dev
```

Frontend runs at http://localhost:5173
Backend runs at http://localhost:4000

If you just want to try the UI without the backend, open src/api/patients.ts and src/api/tasks.ts and change USE_MOCK to true. Then just run npm run dev without starting the server.

To run tests:
```bash
npm run test
```

---

## What it does

The board shows patients as rows and task status as columns — Overdue, Due today, Upcoming, Completed. The idea is you can see at a glance which patients need attention.

- Search patients by name using the search box
- Filter tasks by role so a nurse only sees nurse tasks
- Filter by time — overdue, today, upcoming
- Add a new task to any patient from the + New task button or the + Add task button on each patient row
- Mark a task complete — it moves to the completed column instantly. If the server call fails it snaps back and shows an error message.

---

## Folder structure

```
src/
├── api/           API functions — patients.ts, tasks.ts, mockData.ts
├── types/         TypeScript interfaces — task.ts, patient.ts
├── hooks/         State and logic — TaskboardContext, useTaskStatus, useFilteredTasks
├── components/    Reusable UI — TaskCard, NewTaskModal, Toast
└── pages/         Board pages — Taskboard, BoardHeader, BoardFilters, PatientRow

server/
├── index.ts       Express server entry point
├── data.ts        Patient and task seed data
└── routes/        patients.ts and tasks.ts route handlers
```

I tried to keep things separated so each file has one job. The API layer is completely separate from the components so switching from mock to real backend only needed changes in two files.

---

## Backend

The backend is a simple Express server with 4 endpoints:

```
GET  /patients              returns all patients
GET  /patients/:id/tasks    returns tasks for one patient
POST /patients/:id/tasks    creates a new task
PATCH /tasks/:id            updates a task (mark complete, change due date etc)
```

You can test these directly in the browser or Postman:
```
http://localhost:4000/patients
http://localhost:4000/patients/p1/tasks
```

Data lives in memory so it resets when you restart the server. For a real app this would be a database.

---

## Why Context and useReducer

I looked at React Query and Redux before deciding.

React Query is good when the main problem is caching and keeping server data fresh. But the core challenge here is optimistic UI with rollback — I needed to control exactly what happens when a server call fails. With React Query that logic goes into onMutate and onError callbacks and I found it harder to follow what was actually happening.

Redux would work but felt like too much for one domain — slices, selectors, action creators, a lot of files for what is essentially one page.

I went with Context and useReducer because the reducer makes every state change visible in one place. When a task creation fails I can see exactly which action fires and what the next state looks like. It also made the tests easier to write since I can test the reducer logic directly.

The downside is every context consumer re-renders when any state changes. For 5 patients and 20 tasks this is fine. For a bigger dataset I would split into a tasks context and a separate UI/filter context.

---

## Data decisions

The spec left the API shapes open so I had to decide them myself.

I used a plain YYYY-MM-DD string for dueDate instead of a full timestamp. Dialysis tasks are scheduled by date not time and a full timestamp caused a timezone problem — a task due today in one timezone was showing as yesterday in UTC. Parsing the date parts separately and comparing at local midnight fixed it.

I did not store status on the server. Every render it gets calculated from dueDate compared to today. So a task that was upcoming last week automatically becomes overdue today without any cron job or manual update. The deriveStatus function in hooks/useTaskStatus.ts handles this.

role is a union type not an enum. Adding a new role is one line in types/task.ts and TypeScript immediately shows every place that needs updating.

---

## Assumptions

No authentication. The spec did not mention it so I treated role filtering as a view preference not a permission check.

Recurring tasks are mentioned in the scenario but there is no recurrence model in the spec. All tasks are one-off instances. Adding recurrence would need a recurrenceRule field and a separate creation flow.

The backend uses in-memory storage. Data survives frontend refreshes but resets when the server restarts. A real deployment would use a database.

---

## Known limitations and what I would do next

- No retry logic. When an API call fails it rolls back immediately without trying again. I would add retry with exponential backoff as the next thing.
- No way to edit a task after creating it — only mark complete.
- No overflow handling when a patient has many tasks in one column.
- Data resets when the backend server restarts since there is no database.
- The date picker in the modal is browser default which looks different on each browser.

---

## Seed data

Patient and task data is in server/data.ts for the backend and src/api/mockData.ts for the mock layer. Both have the same 5 patients and 19 tasks. Tasks cover all three roles and all four status states so the board looks populated on first load.

No script needed — data loads automatically when the server starts.

---

## AI usage

I used Claude during this project.

What I used it for:
- Initial boilerplate for the reducer and context setup — I had not written a reducer with optimistic rollback before and used it to understand the pattern
- Dark theme CSS — I described the colour scheme I wanted and used it to generate the initial colour values, then adjusted them myself
- Debugging a CORS error when connecting the frontend to the Express backend
- Fixing a TypeScript error in the test files related to mocking the API modules

