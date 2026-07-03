import { type FormEvent, useState } from "react";
import { z } from "zod";
import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/error-message";
import { tasksService, type User } from "@/services/tasks-service";

const loginSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(1, "User name is required.")
    .max(20, "User name must be 20 characters or less.")
});

type LoginProps = {
  onLogin: (user: Pick<User, "id" | "name">) => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [draftName, setDraftName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = loginSchema.safeParse({ userName: draftName });

    if (!result.success) {
      setError(result.error.issues[0]?.message || "Invalid user name.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const user = await tasksService.resolveUser(result.data.userName);
      onLogin({ id: user.id, name: user.name });
    } catch (submitError) {
      setError(
        getErrorMessage(submitError, "Unable to sign in. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full flex flex-col h-screen bg-black p-5">
      <div className="flex-1 flex justify-center items-center">
        <Card className="w-full max-w-sm mx-auto rounded-md p-7">
          <div className="flex flex-col gap-6">
            <ClipboardCheck className="w-10 h-10 text-sky-600 mx-auto" />
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-medium text-sky-600">
                Task Dashboard
              </h1>
              <p className="text-base">Create a user name or enter an existing one to continue.</p>
            </div>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <Field className="gap-3">
                <Label htmlFor="user-name">User name</Label>
                <Input
                  id="user-name"
                  className="rounded-none h-12"
                  value={draftName}
                  onChange={(event) => {
                    setDraftName(event.target.value);
                    setError("");
                  }}
                  placeholder="Username"
                />
                {error && <FieldError id="screen-name-error">{error}</FieldError>}
              </Field>

              <Button
                className="font-normal text-base w-full p-6 cursor-pointer"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Continuing..." : "Continue"}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </main>
  );
}