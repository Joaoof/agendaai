import { redirect } from 'next/navigation';
import { createServerClient } from "@/lib/supabase/server";
import { PlannerContent } from "@/components/planner-content";

export default async function PlannerPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <PlannerContent />;
}
