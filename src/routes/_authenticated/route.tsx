import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }

    // Identity verification hands off straight into the onboarding interview:
    // until it is finished, every app page routes back to it.
    if (location.pathname !== "/onboarding") {
      const { data: interview } = await supabase
        .from("onboarding_interviews")
        .select("status")
        .eq("user_id", data.session.user.id)
        .maybeSingle();

      if (!interview || interview.status !== "completed") {
        throw redirect({ to: "/onboarding" });
      }
    }
  },
  component: () => <Outlet />,
});
