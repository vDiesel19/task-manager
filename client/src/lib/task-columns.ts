export const taskColumns = [
  { key: "not_started", label: "Not Started" },
  { key: "in_progress", label: "In Progress" },
  { key: "complete", label: "Complete" }
] as const;

export type TaskStatus = (typeof taskColumns)[number]["key"];

export const taskStatuses = taskColumns.map((column) => column.key) as [
  TaskStatus,
  ...TaskStatus[]
];
