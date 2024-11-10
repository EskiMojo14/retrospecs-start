import type { Session } from "@supabase/supabase-js";
import { useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createRequiredContext } from "required-react-context";

export const useSupabase = () => useRouter().options.context.supabase;

export const { useSession, SessionProvider: OriginalSessionProvider } =
  createRequiredContext<Session | null>().with({
    name: "session",
  });

export function SessionProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabase();
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setSession(null);
      } else if (session) {
        setSession(session);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);
  return (
    <OriginalSessionProvider session={session}>
      {children}
    </OriginalSessionProvider>
  );
}
