import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { formatDate, formatMoney } from "../utils/formatters";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [selectedMotif, setSelectedMotif] = useState(null);

  const [editingExpense, setEditingExpense] =
  useState(null);

  const [formData, setFormData] = useState({
    date_depense: "",
    montant: "",
    source_depense: "cotisation",
    motif_commentaire: "",
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .order("date_depense", { ascending: false });

    setExpenses(data || []);
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    let error;

if (editingExpense) {
  const response = await supabase
    .from("expenses")
    .update(formData)
    .eq("id", editingExpense);

  error = response.error;
} else {
  const response = await supabase
    .from("expenses")
    .insert([formData]);

  error = response.error;
}


    if (error) {
      alert("Erreur");
    } else {
      alert("Dépense ajoutée");

      setFormData({
        date_depense: "",
        montant: "",
        source_depense: "cotisation",
        motif_commentaire: "",
      });
      setEditingExpense(null);	
      await fetchExpenses();
    }
  }

async function handleDelete(id) {
  const confirmDelete = window.confirm(
    "Supprimer cette dépense ?"
  );

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Erreur suppression");
  } else {
    await fetchExpenses();
  }
}


function handleEdit(expense) {
  setEditingExpense(expense.id);

  setFormData({
    date_depense: expense.date_depense,
    montant: expense.montant,
    source_depense: expense.source_depense,
    motif_commentaire:
      expense.motif_commentaire,
  });
}


  // 🔹 Grouper par motif
  const grouped = expenses.reduce((acc, item) => {
    const key = item.motif_commentaire || "Sans motif";

    if (!acc[key]) acc[key] = [];
    acc[key].push(item);

    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dépenses</h2>

      {/* FORMULAIRE */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          <input
            type="date"
            name="date_depense"
            value={formData.date_depense}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="text"
            name="montant"
            placeholder="Montant"
            value={formData.montant}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <select
            name="source_depense"
            value={formData.source_depense}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          >
            <option value="cotisation">Cotisation</option>
            <option value="sociale">Sociale</option>
          </select>

          <input
            type="text"
            name="motif_commentaire"
            placeholder="Motif / commentaire"
            value={formData.motif_commentaire}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-lg"
          >
            {editingExpense
  ? "Modifier"
  : "Ajouter"}

          </button>
        </form>
      </div>

      {/* BOX MOTIFS */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h3 className="text-xl font-bold mb-4">
          Dépenses par motif
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Object.keys(grouped).map((motif) => {
            const total = grouped[motif].reduce(
              (sum, item) => sum + Number(item.montant),
              0
            );

            return (
              <div
                key={motif}
                onClick={() => setSelectedMotif(motif)}
                className="cursor-pointer border rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <p className="font-bold">{motif}</p>

                <p className="text-gray-600 mt-2">
                  Total : {formatMoney(total)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* HISTORIQUE */}
      {selectedMotif && (
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-xl font-bold mb-4">
            Historique : {selectedMotif}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-10 gap-2">
            {grouped[selectedMotif].map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-2 text-sm bg-slate-50"
              >
                <p className="font-bold">
                  {formatMoney(item.montant)}
                </p>

                <p>{formatDate(item.date_depense)}</p>

                <p className="text-xs">
                  {item.source_depense}
                </p>
              
               <div className="flex gap-2 mt-2">
  <button
    onClick={() => handleEdit(item)}
    className="text-xs bg-yellow-500 text-white px-2 py-1 rounded"
  >
    Modifier
  </button>

  <button
    onClick={() => handleDelete(item.id)}
    className="text-xs bg-red-600 text-white px-2 py-1 rounded"
  >
    Supprimer
  </button>
</div>


              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;