"use client";

import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "../../../../trpc/client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { GeneratedAvatar } from "@/components/generated-avatar";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import { AgentGetOne } from "../../types";
import { agentsInsertSchema } from "../../schemas";

interface AgentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: AgentGetOne;
}

type AgentFormValues = z.infer<typeof agentsInsertSchema>;

export const AgentForm = ({
  onSuccess,
  onCancel,
  initialValues,
}: AgentFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const form = useForm<AgentFormValues>({
    defaultValues: {
      name: initialValues?.name ?? "",
      instructions: initialValues?.instructions ?? "",
    },
  });
  const name = useWatch({ control: form.control, name: "name" });

  const invalidateAgentQueries = async () => {
    await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));

    if (initialValues?.id) {
      await queryClient.invalidateQueries(
        trpc.agents.getOne.queryOptions({ id: initialValues.id }),
      );
    }

    onSuccess?.();
  };

  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: invalidateAgentQueries,
      onError: (error) => {
        toast.add({
          title: "Unable to create agent",
          description: error.message,
          type: "error",
        });
      },
    }),
  );

  const updateAgent = useMutation(
    trpc.agents.update.mutationOptions({
      onSuccess: invalidateAgentQueries,
      onError: (error) => {
        toast.add({
          title: "Unable to update agent",
          description: error.message,
          type: "error",
        });
      },
    }),
  );

  const isPending = createAgent.isPending || updateAgent.isPending;

  const onSubmit = (values: AgentFormValues) => {
    form.clearErrors();
    const result = agentsInsertSchema.safeParse(values);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === "name" || field === "instructions") {
          form.setError(field, { type: "manual", message: issue.message });
        }
      }
      return;
    }

    if (initialValues?.id) {
      updateAgent.mutate({ id: initialValues.id, ...result.data });
    } else {
      createAgent.mutate(result.data);
    }
  };

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <GeneratedAvatar
        seed={name ?? ""}
        variant="botttsNeutral"
        className="size-16 border"
      />
      <Field data-invalid={!!form.formState.errors.name}>
        <FieldLabel htmlFor="agent-name">Name</FieldLabel>
        <Input
          id="agent-name"
          placeholder="e.g. Math tutor"
          aria-invalid={!!form.formState.errors.name}
          disabled={isPending}
          {...form.register("name")}
        />
        <FieldError errors={[form.formState.errors.name]} />
      </Field>
      <Field data-invalid={!!form.formState.errors.instructions}>
        <FieldLabel htmlFor="agent-instructions">Instructions</FieldLabel>
        <Textarea
          id="agent-instructions"
          placeholder="You are a helpful math assistant that can answer questions and help with assignments."
          aria-invalid={!!form.formState.errors.instructions}
          disabled={isPending}
          {...form.register("instructions")}
        />
        <FieldError errors={[form.formState.errors.instructions]} />
      </Field>
      <div className="flex justify-between gap-x-2">
        {onCancel && (
          <Button
            variant="ghost"
            disabled={isPending}
            type="button"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button disabled={isPending} type="submit">
          {isPending ? "Saving..." : initialValues?.id ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};
