import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import Calendar from "@/components/calendar";

export default async function HomePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen bg-background">
      <Calendar />
    </main>
  );
}
