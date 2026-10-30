import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { connection } from "next/server";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "@/app/constants";
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

type SearchParams = Record<string, string | string[] | undefined>;

interface Props {
  searchParams: Promise<SearchParams>;
}

const AgentsPageContent = async ({ searchParams }: Props) => {
  await connection();
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const parsedPage = Number(pageParam);
  const filters = {
    page:
      Number.isSafeInteger(parsedPage) && parsedPage > 0
        ? parsedPage
        : DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    search: Array.isArray(params.search)
      ? params.search[0] ?? ""
      : params.search ?? "",
  };

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.agents.getMany.queryOptions({
      ...filters,
    }),
  );

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

const Page = ({ searchParams }: Props) => (
  <Suspense fallback={<AgentsViewLoading />}>
    <AgentsPageContent searchParams={searchParams} />
  </Suspense>
);

export default Page;