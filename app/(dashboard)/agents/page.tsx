import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { connection } from "next/server";

import { getQueryClient, trpc } from "../../trpc/server";

import { 
  AgentsView, 
  AgentsViewError, 
  AgentsViewLoading
} from "../../modules/agents/ui/views/agents-view";
import { AgentsListHeader } from "@/app/modules/agents/ui/components/agents-list-header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const AgentsPageContent = async () => {
  await connection();
  const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      redirect("/auth/sign-in");
    }
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions());

  return (
    <>
      <AgentsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AgentsViewLoading />}>
          <ErrorBoundary fallback={<AgentsViewError />}>
            <AgentsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

const Page = () => (
  <Suspense fallback={<AgentsViewLoading />}>
    <AgentsPageContent />
  </Suspense>
);

export default Page;