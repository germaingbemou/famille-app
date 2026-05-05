import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { formatDate, formatMoney } from "../utils/formatters";

function Sociales({ role }) {
  const [members, setMembers] = useState([]);
  const [sociales, setSociales] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [editingSociale, setEditingSociale] = useState(null);

  const [formData, setFormData] = useState({
    member_id: "",
    date_sociale: "",
    montant: "",
    commentaire: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: membersData } = await supabase.from("members").select("*");

    const { data: socialesData } = await supabase
      .from("sociales")
      .select("*")
      .order("date_sociale", { ascending: false });

    setMembers(membersData || []);
    setSociales(socialesData || []);
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (editingSociale) {
      await supabase
        .from("sociales")
        .update(formData)
        .eq("id", editingSociale);
    } else {
      await supabase.from("sociales").insert([formData]);
    }

    setFormData({
      member_id: "",
      date_sociale: "",
      montant: "",
      commentaire: "",
    });

    setEditingSociale(null);
    fetchData();
  }

  function handleEdit(s) {
    setEditingSociale(s.id);
    setFormData(s);
  }

  async function handleDelete(id) {
    await supabase.from("sociales").delete().eq("id", id);
    fetchData();
  }

  const socialesDuMembre = selectedMemberId
    ? sociales.filter((s) => s.member_id === selectedMemberId)
    : [];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Sociales</h2>

      {/* FORMULAIRE ADMIN */}
      {role === "admin" && (
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            <select
              name="member_id"
              value={formData.member_id}
              onChange={handleChange}
              className="border p-3 rounded-lg"
              required
            >
              <option value="">Sélectionner un membre</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom_complet}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="date_sociale"
              value={formData.date_sociale}
              onChange={handleChange}
              className="border p-3 rounded-lg"
              required
            />

            <input
              name="montant"
              placeholder="Montant"
              value={formData.montant}
              onChange={handleChange}
              className="border p-3 rounded-lg"
              required
            />

            <input
              name="commentaire"
              placeholder="Commentaire"
              value={formData.commentaire}
              onChange={handleChange}
              className="border p-3 rounded-lg"
            />

            <button className="bg-blue-600 text-white p-3 rounded-lg">
              Enregistrer
            </button>
          </form>
        </div>
      )}

      {/* LISTE MEMBRES EN BOX */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h3 className="text-xl font-bold mb-4">Sélectionner un membre</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {members.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedMemberId(m.id)}
              className={`cursor-pointer border p-4 rounded-xl shadow-sm hover:shadow-md ${
                selectedMemberId === m.id
                  ? "border-blue-600 ring-2 ring-blue-200"
                  : ""
              }`}
            >
              <p className="font-bold">{m.nom_complet}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HISTORIQUE */}
      {selectedMemberId && (
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-xl font-bold mb-4">
            Historique sociales
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2">
            {socialesDuMembre.map((s) => (
              <div
                key={s.id}
                className="border rounded-lg p-2 text-sm bg-slate-50"
              >
                <p className="font-bold">{formatMoney(s.montant)}</p>
                <p className="text-gray-500">
                  {formatDate(s.date_sociale)}
                </p>

                {s.commentaire && (
                  <p className="text-gray-600">{s.commentaire}</p>
                )}

                {role === "admin" && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="text-xs bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Modifier
                    </button>

                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Sociales;