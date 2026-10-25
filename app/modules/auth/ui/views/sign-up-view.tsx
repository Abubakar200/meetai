"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

type SignUpForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const formSchema = z
  .object({
    name: z.string().trim().min(1, "Please enter your name."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const SignUpView = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignUpForm>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignUpForm) => {
    setError(null);
    form.clearErrors();

    const result = formSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      if (fieldErrors.name?.[0]) {
        form.setError("name", { message: fieldErrors.name[0] });
      }
      if (fieldErrors.email?.[0]) {
        form.setError("email", { message: fieldErrors.email[0] });
      }
      if (fieldErrors.password?.[0]) {
        form.setError("password", { message: fieldErrors.password[0] });
      }
      if (fieldErrors.confirmPassword?.[0]) {
        form.setError("confirmPassword", { message: fieldErrors.confirmPassword[0] });
      }

      return;
    }

    try {
      const response = await authClient.signUp.email({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      });

      if (response.error) {
        setError(response.error.message ?? "Unable to create your account. Please try again.");
        return;
      }

      router.replace("/");
    } catch {
      setError("Unable to create your account right now. Please try again.");
    }
  };

  const firstFieldError =
    form.formState.errors.name?.message ||
    form.formState.errors.email?.message ||
    form.formState.errors.password?.message ||
    form.formState.errors.confirmPassword?.message;

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <form
              noValidate
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-balance text-muted-foreground">
                  Sign up to get started with Meet.AI
                </p>
              </div>

              {(error || firstFieldError) && (
                <Alert variant="destructive">
                  <AlertTitle>{error || firstFieldError}</AlertTitle>
                </Alert>
              )}

              <div className="flex flex-col gap-4">
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    {...form.register("name")}
                    aria-invalid={Boolean(form.formState.errors.name)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    {...form.register("email")}
                    aria-invalid={Boolean(form.formState.errors.email)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="********"
                    {...form.register("password")}
                    aria-invalid={Boolean(form.formState.errors.password)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="********"
                    {...form.register("confirmPassword")}
                    aria-invalid={Boolean(form.formState.errors.confirmPassword)}
                  />
                </Field>
              </div>

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating account..." : "Create account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/sign-in" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>

          <div className="bg-radial from-green-700 to-green-900 relative hidden md:flex flex-col gap-y-4 items-center justify-center">
            <img src="/logo.svg" alt="Meet.AI" className="h-[92px] w-[92px]" />
            <p className="text-2xl font-semibold text-white">Meet.AI</p>
          </div>
        </CardContent>
      </Card>

      <p className="px-4 text-center text-xs text-muted-foreground">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
};

export default SignUpView;
