import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { SearchParams } from "nuqs/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { loadSearchParams } from "@/app/modules/agents/params";
import { auth } from "@/lib/auth";
import { MeetingsListHeader } from "@/app/modules/mettings/ui/components/meeting-list-header";
import { getQueryClient, trpc } from "../../trpc/server";
import { 
  MeetingsView, 
  MeetingsViewError, 
  MeetingsViewLoading
} from "../../modules/mettings/ui/views/meetings-view";

interface Props {
  searchParams: Promise<SearchParams>;
}
const Page = async ({ searchParams }: Props) => {
  const filters = await loadSearchParams(searchParams);
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/auth/sign-in");
  }
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.meetings.getMany.queryOptions({
      ...filters,
    })  );

  return (
    <>
     <MeetingsListHeader />
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<MeetingsViewLoading />}>
        <ErrorBoundary fallback={<MeetingsViewError />}>
          <MeetingsView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
    </>
  );
};
 
export default Page;