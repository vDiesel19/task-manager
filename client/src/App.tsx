import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import EmptyTasksState from "./components/empty-tasks-state";
import Login from "./components/login";
import DashboardHeader from "./components/dashboard-header";
import TaskBoard from "./components/task-board";
import TaskDialog, {
  taskToFormValues,
  type TaskFormValues
} from "./components/task-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/error-message";
import { taskStatuses, type TaskStatus } from "@/lib/task-columns";
import { tasksService, type Task } from "@/services/tasks-service";
import { CirclePlus } from "lucide-react";

export default function App() {
  const { userName, userId, isLoggedIn, isValidating, login, logout: authLogout } =
    useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await tasksService.getTasks(userId);
      setTasks(data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load tasks."));
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    fetchTasks();
  }, [userId, fetchTasks]);

  const groupedTasks = useMemo(
    () =>
      Object.fromEntries(
        taskStatuses.map((status) => [
          status,
          tasks.filter((task) => task.status === status)
        ])
      ) as Record<TaskStatus, Task[]>,
    [tasks]
  );

  const dashboardMessage =
    tasks.length === 0
      ? "Let's add some tasks."
      : "Let's manage your tasks.";

  const handleLogout = () => {
    authLogout();
    setTasks([]);
  };

  const submitTask = async (values: TaskFormValues) => {
    if (!userId) return;

    const isEditing = Boolean(selectedTask);

    try {
      if (selectedTask) {
        await tasksService.updateTask(selectedTask.id, values);
      } else {
        await tasksService.createTask({ ...values, userId });
      }

      setSelectedTask(null);
      await fetchTasks();
      toast.success(
        isEditing
          ? "Task changes saved successfully."
          : "Task created successfully."
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save task."));
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleTaskDialogOpenChange = (open: boolean) => {
    setIsTaskDialogOpen(open);

    if (!open) {
      setSelectedTask(null);
    }
  };

  const handleDelete = async (id: Task["id"]) => {
    try {
      await tasksService.deleteTask(id);
      await fetchTasks();
      toast.success("Task deleted successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete task."));
    }
  };

  if (isValidating) {
    return null;
  }

  if (!isLoggedIn || !userId) {
    return <Login onLogin={login} />;
  }

  return (
    <main className="flex h-screen w-full flex-col overflow-hidden">
      <DashboardHeader onLogout={handleLogout} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-100">
        <div className="w-full max-w-screen-xl mx-auto shrink-0 py-5">
          <div className="flex flex-row items-center justify-between gap-4 px-5">
            <p className="m-0 text-left text-lg font-normal leading-6 text-slate-600 lg:text-xl">
              Hello, {userName}! {dashboardMessage}
            </p>
            <TaskDialog
              initialValues={
                selectedTask ? taskToFormValues(selectedTask) : undefined
              }
              onOpenChange={handleTaskDialogOpenChange}
              onSubmit={submitTask}
              open={isTaskDialogOpen}
              trigger={
                <Button
                  className="w-28 cursor-pointer p-5"
                  type="button"
                  onClick={() => setSelectedTask(null)}
                >
                  <CirclePlus className="h-4 w-4" /> Add Task
                </Button>
              }
            />
          </div>
        </div>

        {tasks.length === 0 ? (
          <EmptyTasksState />
        ) : (
          <TaskBoard
            groupedTasks={groupedTasks}
            userId={userId}
            onCreateTask={submitTask}
            onDelete={handleDelete}
            onEdit={handleEditTask}
          />
        )}
      </div>
    </main>
  );
}
