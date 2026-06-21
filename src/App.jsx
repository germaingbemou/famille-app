import { useEffect, useState } from "react";
import { supabase } from "./services/supabase";

import Login from "./pages/Login";
import MainLayout from "./layouts/MainLayout";

function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState("lecteur");
  const [loading, setLoading] = useState(true);

  async function fetchRole(userId) {
    if (!userId) {
      setRole("lecteur");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.log("Erreur rôle:", error);
      setRole("lecteur");
    } else {
      setRole(data?.role || "lecteur");
    }
  }

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.log("Erreur session:", error);
      }

      setSession(data.session);

      if (data.session?.user) {
        await fetchRole(data.session.user.id);
      }

      setLoading(false);
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);

      if (newSession?.user) {
        await fetchRole(newSession.user.id);
      } else {
        setRole("lecteur");
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return <MainLayout role={role} />;
}

export default App;