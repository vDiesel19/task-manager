import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { taskColumns, taskStatuses, type TaskStatus } from "@/lib/task-columns";
import { type Task } from "@/services/tasks-service";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required."),
  description: z.string().trim(),
  status: z.enum(taskStatuses)
});

export type TaskFormValues = z.infer<typeof taskSchema>;

export function taskToFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description || "",
    status: task.status
  };
}

type TaskDialogErrors = Partial<Record<keyof TaskFormValues, string>>;

type TaskDialogProps = {
  initialValues?: TaskFormValues;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  trigger: ReactNode;
};

const emptyTaskForm: TaskFormValues = {
  title: "",
  description: "",
  status: "not_started"
};

export default function TaskDialog({
  initialValues,
  onSubmit,
  onOpenChange,
  open,
  trigger
}: TaskDialogProps) {
  const [values, setValues] = useState<TaskFormValues>(
    initialValues ?? emptyTaskForm
  );
  const [errors, setErrors] = useState<TaskDialogErrors>({});

  const isEditing = Boolean(initialValues);

  useEffect(() => {
    if (!open) return;

    setValues(initialValues ?? emptyTaskForm);
    setErrors({});
  }, [initialValues, open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = taskSchema.safeParse(values);

    if (!result.success) {
      const nextErrors: TaskDialogErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof TaskFormValues | undefined;

        if (field) {
          nextErrors[field] = issue.message;
        }
      }

      setErrors(nextErrors);
      return;
    }

    await onSubmit(result.data);
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="p-5">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this task and save your changes."
              : "Add a task to the dashboard"}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field>
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={values.title}
              onChange={(event) => {
                setValues((current) => ({
                  ...current,
                  title: event.target.value
                }));
                setErrors((current) => ({ ...current, title: undefined }));
              }}
              placeholder="Task title"
              className="rounded-none h-12"
            />
            {errors.title && (
              <FieldError id="task-title-error">{errors.title}</FieldError>
            )}
          </Field>

          <Field>
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={values.description}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  description: event.target.value
                }))
              }
              placeholder="Description"
              className="rounded-none"
            />
          </Field>

          <Field>
            <Label htmlFor="task-status">Status</Label>
            <Select
              value={values.status}
              onValueChange={(status: TaskStatus) => {
                setValues((current) => ({ ...current, status }));
                setErrors((current) => ({ ...current, status: undefined }));
              }}
            >
              <SelectTrigger
                id="task-status"
                className="w-full"
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {taskColumns.map((column) => (
                  <SelectItem key={column.key} value={column.key}>
                    {column.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <FieldError id="task-status-error">{errors.status}</FieldError>
            )}
          </Field>

          <DialogFooter>
            <Button
              className="text-sm text-normal text-white p-5"
              type="submit"
            >
              {isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
