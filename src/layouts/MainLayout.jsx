import { supabase } from "../services/supabase";
import { useState } from "react";

import Dashboard from "../pages/Dashboard";
import Members from "../pages/Members";
import Cotisations from "../pages/Cotisations";
import Sociales from "../pages/Sociales";
import Expenses from "../pages/Expenses";
import Reports from "../pages/Reports";
import Suspensions from "../pages/Suspensions";

function MainLayout({ role }) {
  const [pageActive, setPageActive] = useState("dashboard");

  const menu = [
    { id: "dashboard", label: "Tableau de bord" },
    { id: "members", label: "Membres" },
    { id: "cotisations", label: "Cotisations" },
    { id: "sociales", label: "Sociales" },
    { id: "expenses", label: "Dépenses" },
    { id: "suspensions", label: "Suspensions" },
    { id: "reports", label: "Rapports" },
  ];

  const afficherPage = () => {
    if (pageActive === "dashboard") return <Dashboard role={role} />;
    if (pageActive === "members") return <Members role={role} />;
    if (pageActive === "cotisations") return <Cotisations role={role} />;
    if (pageActive === "sociales") return <Sociales role={role} />;
    if (pageActive === "expenses") return <Expenses role={role} />;
    if (pageActive === "suspensions") return <Suspensions role={role} />;
    if (pageActive === "reports") return <Reports role={role} />;

    return <Dashboard role={role} />;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white p-5">
        <h1 className="text-2xl font-bold mb-2">Gestion Familiale</h1>

        <p className="text-sm text-slate-300 mb-6">
          Rôle : {role || "lecteur"}
        </p>
<button
  onClick={async () => {
    await supabase.auth.signOut();
    window.location.reload();
  }}
  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg mb-6"
>
  Déconnexion
</button>

        <nav className="space-y-2">
          {menu.map((item) => (
            <button
              key={item.id}
              onClick={() => setPageActive(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg ${
                pageActive === item.id
                  ? "bg-blue-600"
                  : "hover:bg-slate-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6">{afficherPage()}</main>
    </div>
  );
}

export default MainLayout;