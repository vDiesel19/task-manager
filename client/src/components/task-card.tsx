import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type Task } from "@/services/tasks-service";

type TaskCardProps = {
  canEdit: boolean;
  onDelete: (id: Task["id"]) => void;
  onEdit: (task: Task) => void;
  task: Task;
};

export default function TaskCard({
  canEdit,
  onDelete,
  onEdit,
  task
}: TaskCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card className="rounded-lg bg-slate-100 p-3 shadow-none">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 text-left">
            <h3 className="text-base font-medium text-slate-950">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-slate-600">{task.description}</p>
            )}

            <p className="text-xs text-slate-500">
              Created by {task.createdByName}
            </p>
          </div>

          {canEdit && (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                aria-label={`Edit ${task.title}`}
                size="icon-sm"
                type="button"
                variant="ghost"
                onClick={() => onEdit(task)}
              >
                <Pencil className="h-4 w-4 text-slate-600" />
              </Button>
              <Button
                aria-label={`Delete ${task.title}`}
                size="icon-sm"
                type="button"
                variant="ghost"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 text-slate-600" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-medium">Are you sure you want to delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col lg:flex-row gap-2">
            <AlertDialogCancel className="w-full text-base text-normal p-5 lg:w-28">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(task.id)}
              className="w-full text-base text-normal p-5 lg:w-28"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
