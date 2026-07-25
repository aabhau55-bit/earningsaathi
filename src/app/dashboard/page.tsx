import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { homeFor } from "@/lib/roles";

// Root: route to the signed-in user's single area, or to login.
export default async function Home() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  redirect(homeFor(user.role));
}
