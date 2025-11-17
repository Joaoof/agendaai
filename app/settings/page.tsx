import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { SettingsContent } from "@/components/settings-content";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <SettingsContent />
      </main>
    </div>
  );
}
