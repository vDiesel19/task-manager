import { type ComponentType } from "react";
import {
  CircleCheck,
  Hourglass,
  Pickaxe,
  type LucideProps
} from "lucide-react";

import { type TaskStatus } from "@/lib/task-columns";

const statusIcons = {
  not_started: Pickaxe,
  in_progress: Hourglass,
  complete: CircleCheck
} satisfies Record<TaskStatus, ComponentType<LucideProps>>;

type StatusIconProps = {
  className?: string;
  status: TaskStatus;
};

export default function StatusIcon({ className, status }: StatusIconProps) {
  const Icon = statusIcons[status];
  return <Icon className={className} />;
}
