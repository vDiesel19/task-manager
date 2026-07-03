import { useState } from "react";
import { CirclePlus } from "lucide-react";

import TaskDialog, { type TaskFormValues } from "@/components/task-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type TaskStatus } from "@/lib/task-columns";

type EmptyColumnCardProps = {
  label: string;
  status: TaskStatus;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
};

export default function EmptyColumnCard({
  label,
  status,
  onSubmit
}: EmptyColumnCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TaskDialog
      initialValues={{ title: "", description: "", status }}
      onOpenChange={setIsOpen}
      onSubmit={onSubmit}
      open={isOpen}
      trigger={
        <Button
          className="h-auto w-full cursor-pointer p-0 hover:bg-transparent"
          type="button"
          variant="ghost"
        >
          <Card className="flex w-full flex-col items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-center shadow-none">
            <CirclePlus className="h-6 w-6 text-slate-600" aria-hidden />
            <div className="text-sm">
              <p className="m-0 font-normal text-slate-600">
                No {label.toLowerCase()} tasks yet.
              </p>
              <p className="font-medium text-slate-900">Add or move one.</p>
            </div>
          </Card>
        </Button>
      }
    />
  );
}
