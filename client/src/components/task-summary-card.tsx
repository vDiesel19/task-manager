import { Card } from "@/components/ui/card";
import StatusIcon from "@/components/status-icon";
import { statusCardClasses } from "@/lib/status-styles";
import { type TaskStatus } from "@/lib/task-columns";

type TaskSummaryCardProps = {
  count: number;
  label: string;
  status: TaskStatus;
};

export default function TaskSummaryCard({
  count,
  label,
  status
}: TaskSummaryCardProps) {
  return (
    <Card className="rounded-lg border-none bg-white p-4 shadow-none">
      <div className="flex items-center justify-between">
        <div className="w-full flex flex-col items-center gap-3 md:flex-row">
          <div
            className={`flex size-10 items-center justify-center rounded-lg ${statusCardClasses[status]}`}
          >
            <StatusIcon className="size-5" status={status} />
          </div>
          <div className="flex flex-col items-center md:gap-2 md:flex-row">
            <p className="text-sm font-medium text-slate-600">{label}</p>
            <p className="text-2xl font-semibold text-slate-950">{count}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
