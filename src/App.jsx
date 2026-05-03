import { useEffect, useState } from "react";
import { supabase } from "./services/supabase";

import Login from "./pages/Login";
import MainLayout from "./layouts/MainLayout";

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getInitialSession() {
      const { data } = await supabase.auth.getSession();

      setSession(data.session);

      if (data.session?.user) {
        await fetchProfile(data.session.user.id);
      }

      setLoading(false);
    }

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.log(error);
      setProfile(null);
    } else {
      setProfile(data);
    }
  }

  if (loading) {
    return <p className="p-6">Chargement...</p>;
  }

  if (!session) {
    return <Login />;
  }

  return <MainLayout profile={profile} />;
}

export default App;