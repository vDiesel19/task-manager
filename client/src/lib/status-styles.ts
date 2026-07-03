import { type TaskStatus } from "@/lib/task-columns";

const statusBackgroundClasses = {
  not_started: "bg-sky-100",
  in_progress: "bg-orange-100",
  complete: "bg-green-100"
} satisfies Record<TaskStatus, string>;

export const statusCardClasses = {
  not_started: `${statusBackgroundClasses.not_started} text-sky-700`,
  in_progress: `${statusBackgroundClasses.in_progress} text-orange-700`,
  complete: `${statusBackgroundClasses.complete} text-green-700`
} satisfies Record<TaskStatus, string>;
