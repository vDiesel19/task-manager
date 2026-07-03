import { CirclePlus } from "lucide-react";

export default function EmptyTasksState() {
  return (
    <section className="w-full max-w-screen-xl mx-auto p-5">
      <div className="flex min-h-80 flex-col items-center justify-center gap-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
        <CirclePlus className="h-8 w-8 text-slate-600" aria-hidden />
        <p className="max-w-sm text-base text-slate-600">
          No tasks exist yet. Click the <span className="font-medium text-slate-900">Add Task</span>{" "}
          button above to create your first task and get started.
        </p>
      </div>
    </section>
  );
}
