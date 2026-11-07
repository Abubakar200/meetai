"use client";

import { z } from "zod";
import { useState } from "react";
import { useWatch, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/app/trpc/client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CommandSelect } from "@/components/command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "@/components/ui/toast";

import { MeetingGetOne } from "../../types";
import { meetingsInsertSchema } from "../../schemas";

import { NewAgentDialog } from "@/app/modules/agents/ui/components/new-agent-dialog";

interface MeetingFormProps {
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
  initialValues?: MeetingGetOne;
}

type MeetingFormValues = z.infer<typeof meetingsInsertSchema>;

export const MeetingForm = ({
  onSuccess,
  onCancel,
  initialValues,
}: MeetingFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [openNewAgentDialog, setOpenNewAgentDialog] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");

  const agents = useQuery(
    trpc.agents.getMany.queryOptions({
      pageSize: 100,
      search: agentSearch,
    }),
  );

  const form = useForm<MeetingFormValues>({
    defaultValues: {
      name: initialValues?.name ?? "",
      agentId: initialValues?.agentId ?? "",
    },
  });
  const agentId = useWatch({ control: form.control, name: "agentId" });

  const invalidateMeetingQueries = async () => {
    await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));

    if (initialValues?.id) {
      await queryClient.invalidateQueries(
        trpc.meetings.getOne.queryOptions({ id: initialValues.id }),
      );
    }
  };

  const createMeeting = useMutation(
    trpc.meetings.create.mutationOptions({
      onSuccess: async (data) => {
        await invalidateMeetingQueries();
        onSuccess?.(data.id);
      },
      onError: (error) => {
        toast.add({
          title: "Unable to create meeting",
          description: error.message,
          type: "error",
        });
      },
    }),
  );

  const updateMeeting = useMutation(
    trpc.meetings.update.mutationOptions({
      onSuccess: async () => {
        await invalidateMeetingQueries();
        onSuccess?.();
      },
      onError: (error) => {
        toast.add({
          title: "Unable to update meeting",
          description: error.message,
          type: "error",
        });

        // TODO: Check if error code is "FORBIDDEN", redirect to "/upgrade"
      },
    }),
  );

  const isPending = createMeeting.isPending || updateMeeting.isPending;

  const onSubmit = (values: MeetingFormValues) => {
    form.clearErrors();
    const result = meetingsInsertSchema.safeParse(values);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === "name" || field === "agentId") {
          form.setError(field, { type: "manual", message: issue.message });
        }
      }
      return;
    }

    if (initialValues?.id) {
      updateMeeting.mutate({ id: initialValues.id, ...result.data });
    } else {
      createMeeting.mutate(result.data);
    }
  };

  return (
    <>
      <NewAgentDialog
        open={openNewAgentDialog}
        onOpenChange={setOpenNewAgentDialog}
      />
      <form
        className="space-y-4"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <fieldset disabled={isPending} className="space-y-4">
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="meeting-name">Name</FieldLabel>
            <Input
              id="meeting-name"
              placeholder="e.g. Math Consultations"
              aria-invalid={!!form.formState.errors.name}
              {...form.register("name")}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.agentId}>
            <FieldLabel className="flex-col items-start">
              Agent
              <div
                id="meeting-agent"
                aria-invalid={!!form.formState.errors.agentId}
                aria-describedby={
                  form.formState.errors.agentId
                    ? "meeting-agent-error"
                    : undefined
                }
              >
                <CommandSelect
                  options={(agents.data?.items ?? []).map((agent) => ({
                    id: agent.id,
                    value: agent.id,
                    children: (
                      <div className="flex items-center gap-x-2">
                        <GeneratedAvatar
                          seed={agent.name}
                          variant="botttsNeutral"
                          className="size-6 border"
                        />
                        <span>{agent.name}</span>
                      </div>
                    ),
                  }))}
                  onSelect={(value) => {
                    form.setValue("agentId", value, {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                    form.clearErrors("agentId");
                  }}
                  onSearch={setAgentSearch}
                  value={agentId}
                  placeholder="Select an agent"
                />
              </div>
            </FieldLabel>
            <FieldDescription>
              Not found what you&apos;re looking for?{" "}
              <button
                type="button"
                className="text-primary hover:underline"
                disabled={isPending}
                onClick={() => setOpenNewAgentDialog(true)}
              >
                Create new agent
              </button>
            </FieldDescription>
            <FieldError
              id="meeting-agent-error"
              errors={[form.formState.errors.agentId]}
            />
          </Field>
        </fieldset>
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
    </>
  );
};
