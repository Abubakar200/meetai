"use client";

import { useTRPC } from "@/app/trpc/client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";
export const HomeView = () => {
  const trpc = useTRPC();
  const {data} = useQuery(trpc.hello.queryOptions({text: 'Abubakar'}))
  return ( 
    <div className="flex flex-col p-4 gap-y-4">
      {data?.greeting}
    </div>
   );
}
 
