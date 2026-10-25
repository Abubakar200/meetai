import { auth } from "@/lib/auth";
import { HomeView } from "./modules/home/ui/views/home-view";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const Home = async () => {

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if(!session) {
    redirect("/auth/sign-in");
  }
  return ( 
    <HomeView />
   );
}
 
export default Home;