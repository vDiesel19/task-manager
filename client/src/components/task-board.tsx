import EmptyColumnCard from "@/components/empty-column-card";
import TaskCard from "@/components/task-card";
import StatusIcon from "@/components/status-icon";
import TaskSummaryCard from "@/components/task-summary-card";
import { type TaskFormValues } from "@/components/task-dialog";
import { taskColumns, type TaskStatus } from "@/lib/task-columns";
import { type Task } from "@/services/tasks-service";

type TaskBoardProps = {
  groupedTasks: Record<TaskStatus, Task[]>;
  userId: number;
  onCreateTask: (values: TaskFormValues) => Promise<void> | void;
  onDelete: (id: Task["id"]) => void;
  onEdit: (task: Task) => void;
};

export default function TaskBoard({
  groupedTasks,
  userId,
  onCreateTask,
  onDelete,
  onEdit
}: TaskBoardProps) {
  return (
    <div className="w-full max-w-screen-xl mx-auto flex flex-col gap-5 px-5 pb-5 md:flex-1">
      <section className="grid shrink-0 grid-cols-3 gap-4">
        {taskColumns.map((column) => (
          <TaskSummaryCard
            count={groupedTasks[column.key].length}
            key={column.key}
            label={column.label}
            status={column.key}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 md:flex-1 md:grid-cols-3 md:items-stretch">
        {taskColumns.map((column) => (
          <div className="flex flex-col gap-2 md:h-full" key={column.key}>
            <div className="flex items-center gap-2">
              <StatusIcon
                className="h-4 w-4 text-slate-600"
                status={column.key}
              />
              <h2 className="m-0 text-base font-medium text-slate-900">
                {column.label}
              </h2>
            </div>

            <div className="min-h-24 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 md:h-full">
              <div className="flex flex-col gap-3">
                {groupedTasks[column.key].length === 0 ? (
                  <EmptyColumnCard
                    label={column.label}
                    status={column.key}
                    onSubmit={onCreateTask}
                  />
                ) : (
                  groupedTasks[column.key].map((task) => (
                    <TaskCard
                      canEdit={userId === task.userId}
                      key={task.id}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      task={task}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
