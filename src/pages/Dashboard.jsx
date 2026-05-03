import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { formatMoney } from "../utils/formatters";

function Dashboard() {
  const [stats, setStats] = useState({
    totalCotisations: 0,
    totalSociales: 0,
    depensesCotisations: 0,
    depensesSociales: 0,
    impayesCotisations: 0,
    impayesSociales: 0,
    totalImpayes: 0,
    soldeCotisations: 0,
    soldeSociales: 0,
    soldeTotal: 0,
    impayesParMembre: [],
  });

const [dateDebut, setDateDebut] = useState("");
const [dateFin, setDateFin] = useState("");

useEffect(() => {
  fetchDashboardData();
}, [dateDebut, dateFin]);

 function isMonthSuspended(year, month, type, suspensions) {
  const monthDate = new Date(year, month, 1);

  return suspensions?.some((suspension) => {
    if (
      suspension.type !== "toutes" &&
      suspension.type !== type
    ) {
      return false;
    }

    const debut = new Date(suspension.date_debut);
    const fin = suspension.date_fin
      ? new Date(suspension.date_fin)
      : new Date();

    const debutMois = new Date(
      debut.getFullYear(),
      debut.getMonth(),
      1
    );

    const finMois = new Date(
      fin.getFullYear(),
      fin.getMonth(),
      1
    );

    return monthDate >= debutMois && monthDate <= finMois;
  });
}

function isMonthSuspended(year, month, type, suspensions) {
  const monthDate = new Date(year, month, 1);

  return suspensions?.some((suspension) => {
    if (
      suspension.type !== "toutes" &&
      suspension.type !== type
    ) {
      return false;
    }

    const debut = new Date(suspension.date_debut);

    const fin = suspension.date_fin
      ? new Date(suspension.date_fin)
      : new Date();

    const debutMois = new Date(
      debut.getFullYear(),
      debut.getMonth(),
      1
    );

    const finMois = new Date(
      fin.getFullYear(),
      fin.getMonth(),
      1
    );

    return (
      monthDate >= debutMois &&
      monthDate <= finMois
    );
  });
}

function getMonthsLate(lastDate, type, suspensions) {
  if (!lastDate) return 0;

  const last = new Date(lastDate);
  const now = new Date();

  let count = 0;

  let year = last.getFullYear();
  let month = last.getMonth() + 1;

  while (
    year < now.getFullYear() ||
    (year === now.getFullYear() &&
      month <= now.getMonth())
  ) {
    if (
      !isMonthSuspended(
        year,
        month,
        type,
        suspensions
      )
    ) {
      count++;
    }

    month++;

    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return count;
}





function setToday() {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  setDateDebut(today);
  setDateFin(today);
}

function setWeek() {
  const now = new Date();

  const firstDay = new Date(now);
  firstDay.setDate(now.getDate() - 7);

  setDateDebut(
    firstDay.toISOString().split("T")[0]
  );

  setDateFin(
    now.toISOString().split("T")[0]
  );
}

function setMonth() {
  const now = new Date();

  const firstDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  setDateDebut(
    firstDay.toISOString().split("T")[0]
  );

  setDateFin(
    now.toISOString().split("T")[0]
  );
}

function setAll() {
  setDateDebut("");
  setDateFin("");
}


  async function fetchDashboardData() {
    const { data: members } = await supabase.from("members").select("*");

    let cotisationsQuery = supabase
  .from("cotisations")
  .select("member_id, montant, date_cotisation");

if (dateDebut) {
  cotisationsQuery = cotisationsQuery.gte(
    "date_cotisation",
    dateDebut
  );
}

if (dateFin) {
  cotisationsQuery = cotisationsQuery.lte(
    "date_cotisation",
    dateFin
  );
}

const { data: cotisations } =
  await cotisationsQuery;


let socialesQuery = supabase
  .from("sociales")
  .select("member_id, montant, date_sociale");

if (dateDebut) {
  socialesQuery = socialesQuery.gte(
    "date_sociale",
    dateDebut
  );
}

if (dateFin) {
  socialesQuery = socialesQuery.lte(
    "date_sociale",
    dateFin
  );
}

const { data: sociales } =
  await socialesQuery;

   
   let expensesQuery = supabase
  .from("expenses")
  .select("montant, source_depense, date_depense");

if (dateDebut) {
  expensesQuery = expensesQuery.gte(
    "date_depense",
    dateDebut
  );
}

if (dateFin) {
  expensesQuery = expensesQuery.lte(
    "date_depense",
    dateFin
  );
}

const { data: expenses } =
  await expensesQuery;
  const { data: suspensions } = await supabase
  .from("suspensions")
  .select("*");
    

    const totalCotisations =
      cotisations?.reduce((sum, item) => sum + Number(item.montant), 0) || 0;

    const totalSociales =
      sociales?.reduce((sum, item) => sum + Number(item.montant), 0) || 0;

    const depensesCotisations =
      expenses
        ?.filter((e) => e.source_depense === "cotisation")
        .reduce((sum, item) => sum + Number(item.montant), 0) || 0;

    const depensesSociales =
      expenses
        ?.filter((e) => e.source_depense === "sociale")
        .reduce((sum, item) => sum + Number(item.montant), 0) || 0;

    const impayesParMembre =
      members?.map((member) => {
        const cotisationsMembre =
          cotisations?.filter((c) => c.member_id === member.id) || [];

        const socialesMembre =
          sociales?.filter((s) => s.member_id === member.id) || [];

        const derniereCotisation =
          cotisationsMembre.length > 0
            ? cotisationsMembre
                .map((c) => c.date_cotisation)
                .sort()
                .reverse()[0]
            : null;

        const derniereSociale =
          socialesMembre.length > 0
            ? socialesMembre
                .map((s) => s.date_sociale)
                .sort()
                .reverse()[0]
            : null;

       const moisCotisationsEnRetard =
  getMonthsLate(
    derniereCotisation,
    "cotisation",
    suspensions
  );

const moisSocialesEnRetard =
  getMonthsLate(
    derniereSociale,
    "sociale",
    suspensions
  );

        const impayeCotisation =
          moisCotisationsEnRetard *
          Number(member.montant_cotisation_mensuelle || 0);

        const impayeSociale =
          moisSocialesEnRetard *
          Number(member.montant_sociale_mensuelle || 0);

        return {
          id: member.id,
          nom: member.nom_complet,
          impayeCotisation,
          impayeSociale,
          total: impayeCotisation + impayeSociale,
        };
      }) || [];

    const impayesCotisations = impayesParMembre.reduce(
      (sum, m) => sum + m.impayeCotisation,
      0
    );

    const impayesSociales = impayesParMembre.reduce(
      (sum, m) => sum + m.impayeSociale,
      0
    );

    const totalImpayes = impayesCotisations + impayesSociales;

    const soldeCotisations = totalCotisations - depensesCotisations;
    const soldeSociales = totalSociales - depensesSociales;
    const soldeTotal = soldeCotisations + soldeSociales;

    setStats({
      totalCotisations,
      totalSociales,
      depensesCotisations,
      depensesSociales,
      impayesCotisations,
      impayesSociales,
      totalImpayes,
      soldeCotisations,
      soldeSociales,
      soldeTotal,
      impayesParMembre,
    });
  }

  const cartes = [
    { titre: "Total des cotisations", montant: formatMoney(stats.totalCotisations) },
    { titre: "Cotisations impayées", montant: formatMoney(stats.impayesCotisations) },
    { titre: "Dépenses sur cotisations", montant: formatMoney(stats.depensesCotisations) },
    { titre: "Solde cotisations", montant: formatMoney(stats.soldeCotisations) },
    { titre: "Total sociales", montant: formatMoney(stats.totalSociales) },
    { titre: "Sociales impayées", montant: formatMoney(stats.impayesSociales) },
    { titre: "Dépenses sur sociales", montant: formatMoney(stats.depensesSociales) },
    { titre: "Solde sociales", montant: formatMoney(stats.soldeSociales) },
    { titre: "Total impayés", montant: formatMoney(stats.totalImpayes) },
    { titre: "Solde total", montant: formatMoney(stats.soldeTotal) },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Tableau de bord</h2>
<div className="flex flex-wrap items-center gap-2 mb-6">

  <button
    onClick={setToday}
    className="px-4 py-2 rounded-xl border"
  >
    Aujourd’hui
  </button>

  <button
    onClick={setWeek}
    className="px-4 py-2 rounded-xl border"
  >
    Semaine
  </button>

  <button
    onClick={setMonth}
    className="px-4 py-2 rounded-xl border"
  >
    Mois
  </button>

  <button
    onClick={setAll}
    className="px-4 py-2 rounded-xl border"
  >
    Tout
  </button>

  <input
    type="date"
    value={dateDebut}
    onChange={(e) =>
      setDateDebut(e.target.value)
    }
    className="px-4 py-2 rounded-xl border"
  />

  <span>→</span>

  <input
    type="date"
    value={dateFin}
    onChange={(e) =>
      setDateFin(e.target.value)
    }
    className="px-4 py-2 rounded-xl border"
  />

</div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {cartes.map((carte) => (
          <div key={carte.titre} className="bg-white p-5 rounded-xl shadow">
            <p className="text-gray-500">{carte.titre}</p>
            <h3 className="text-2xl font-bold mt-2">{carte.montant}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-xl font-bold mb-4">Impayés par membre</h3>

        {stats.impayesParMembre.filter((m) => m.total > 0).length === 0 ? (
          <p>Aucun impayé trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.impayesParMembre
              .filter((m) => m.total > 0)
              .map((membre) => (
                <div key={membre.id} className="border rounded-lg p-4">
                  <p className="font-bold">{membre.nom}</p>

                  <p className="text-sm text-gray-600">
                    Cotisations impayées : {formatMoney(membre.impayeCotisation)}
                  </p>

                  <p className="text-sm text-gray-600">
                    Sociales impayées : {formatMoney(membre.impayeSociale)}
                  </p>

                  <p className="font-semibold mt-1">
                    Total impayé : {formatMoney(membre.total)}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;