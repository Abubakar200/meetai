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

type SignInForm = {
  email: string;
  password: string;
};

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export const SignInView = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [socialProvider, setSocialProvider] = useState<"google" | "github" | null>(null);

  const form = useForm<SignInForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInForm) => {
    setError(null);
    form.clearErrors();
    const result = formSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      if (fieldErrors.email?.[0]) {
        form.setError("email", { message: fieldErrors.email[0] });
      }

      if (fieldErrors.password?.[0]) {
        form.setError("password", { message: fieldErrors.password[0] });
      }

      return;
    }

    try {
      const response = await authClient.signIn.email({
        email: result.data.email,
        password: result.data.password,
      });

      if (response.error) {
        setError(response.error.message ?? "Unable to sign in. Please try again.");
        return;
      }

      router.replace("/");
    } catch {
      setError("Unable to sign in right now. Please try again.");
    }
  };

  const onSocialSignIn = async (provider: "google" | "github") => {
    setError(null);
    setSocialProvider(provider);

    try {
      const response = await authClient.signIn.social({
        provider,
      });

      if (response.error) {
        setError(response.error.message ?? `Unable to sign in with ${provider}.`);
      }
    } catch {
      setError(`Unable to sign in with ${provider}. Please try again.`);
    } finally {
      setSocialProvider(null);
    }
  };

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
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your account
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {(error ||
                  form.formState.errors.email?.message ||
                  form.formState.errors.password?.message) && (
                  <Alert variant="destructive">
                    <AlertTitle>
                      {error ||
                        form.formState.errors.email?.message ||
                        form.formState.errors.password?.message}
                    </AlertTitle>
                  </Alert>
                )}

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...form.register("email")}
                    aria-invalid={Boolean(form.formState.errors.email)}
                  />
                </Field>

                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    {...form.register("password")}
                    aria-invalid={Boolean(form.formState.errors.password)}
                  />
                </Field>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting || socialProvider !== null}
              >
                {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center gap-2"
                  onClick={() => onSocialSignIn("google")}
                  disabled={form.formState.isSubmitting || socialProvider !== null}
                >
                  <img src="/google.svg" alt="" className="size-4" />
                  {socialProvider === "google" ? "Connecting..." : "Google"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center gap-2"
                  onClick={() => onSocialSignIn("github")}
                  disabled={form.formState.isSubmitting || socialProvider !== null}
                >
                  <img src="/github.svg" alt="" className="size-4" />
                  {socialProvider === "github" ? "Connecting..." : "GitHub"}
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
                  Sign up
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
        By signing in, you agree to our{" "}
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

export default SignInView;