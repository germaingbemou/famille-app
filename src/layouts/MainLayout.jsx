import { useState } from "react";
import Dashboard from "../pages/Dashboard";
import Members from "../pages/Members";
import Cotisations from "../pages/Cotisations";
import Sociales from "../pages/Sociales";
import Expenses from "../pages/Expenses";
import Reports from "../pages/Reports";
import Suspensions from "../pages/Suspensions";

function MainLayout({ profile })  {
  const [pageActive, setPageActive] = useState("dashboard");

  const menu = [
    { id: "dashboard", label: "Tableau de bord" },
    { id: "members", label: "Membres" },
    { id: "cotisations", label: "Cotisations" },
    { id: "sociales", label: "Sociales" },
    { id: "expenses", label: "Dépenses" },
    { id: "reports", label: "Rapports" },
    { id: "suspensions", label: "Suspensions" },
  ];

  const afficherPage = () => {
    if (pageActive === "dashboard") return <Dashboard />;
    if (pageActive === "members") return <Members />;
    if (pageActive === "cotisations") return <Cotisations />;
    if (pageActive === "sociales") return <Sociales />;
    if (pageActive === "expenses") return <Expenses />;
    if (pageActive === "reports") return <Reports />;
    if (pageActive === "suspensions") return <Suspensions />;
    return <Dashboard />;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white p-5">
        <h1 className="text-2xl font-bold mb-8">Gestion Familiale</h1>

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
<main className="flex-1 p-6">
  <div className="mb-4 text-sm text-gray-600">
    Connecté comme :{" "}
    <span className="font-semibold">
      {profile?.email}
    </span>{" "}
    — Rôle :{" "}
    <span className="font-semibold">
      {profile?.role}
    </span>
  </div>

  {afficherPage()}
</main>
    </div>
  );
}

export default MainLayout;