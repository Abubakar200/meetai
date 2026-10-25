"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
export const HomeView = () => {
  const {data: session} = authClient.useSession();
  if(!session) {
    return (
        <p>Loading...</p>
    );
  }
  return ( 
    <div className="flex flex-col p-4 gap-y-4">
      <p className="text-lg font-semibold text-center">Welcome to the App! {session.user.name}</p>
      <Button onClick={() => authClient.signOut({
        fetchOptions: {
            onSuccess: () => {
                redirect("/auth/sign-in");
            }
        }
      })}>Sign Out</Button>
    </div>
   );
}
 
