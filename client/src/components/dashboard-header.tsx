import { ClipboardCheck, LogOut } from "lucide-react"
import { Button } from "./ui/button";

type DashboardHeaderProps = {
  onLogout: () => void;
};

export default function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  return (
    <header className="w-full max-w-screen-xl mx-auto flex shrink-0 flex-row items-center justify-between gap-2 px-4 py-3">
      <div className="flex flex-row items-center gap-2">
        <div className="rounded-full bg-sky-700 p-2.5">
          <ClipboardCheck className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-base font-medium text-sky-700 tracking-normal m-0 lg:text-lg">
          Task Dashboard
        </h1>
      </div>
      <div className="flex flex-row items-center justify-between gap-2">
        <Button
          aria-label="Log out"
          type="button"
          variant="outline"
          onClick={onLogout}
          className="cursor-pointer w-9 h-9 flex items-center gap-2 text-black rounded-md"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}