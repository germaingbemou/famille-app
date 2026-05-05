import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { formatDate, formatMoney } from "../utils/formatters";

function Sociales({ role }) {
  const [members, setMembers] = useState([]);
  const [sociales, setSociales] = useState([]);
  const [cotisations, setCotisations] = useState([]);
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
    const { data: cotisationsData } = await supabase
      .from("cotisations")
      .select("*");

    setMembers(membersData || []);
    setSociales(socialesData || []);
    setCotisations(cotisationsData || []);
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

  const socialesDuMembre = sociales.filter(
    (s) => s.member_id === selectedMemberId
  );

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Sociales</h2>

      {role === "admin" && (
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-2 gap-4"
          >
            <select
              name="member_id"
              value={formData.member_id}
              onChange={handleChange}
              className="border p-2"
            >
              <option value="">Membre</option>
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
              className="border p-2"
            />

            <input
              name="montant"
              placeholder="Montant"
              value={formData.montant}
              onChange={handleChange}
              className="border p-2"
            />

            <input
              name="commentaire"
              placeholder="Commentaire"
              value={formData.commentaire}
              onChange={handleChange}
              className="border p-2"
            />

            <button className="bg-blue-600 text-white p-2">
              Enregistrer
            </button>
          </form>
        </div>
      )}

      <div>
        {members.map((m) => (
          <button key={m.id} onClick={() => setSelectedMemberId(m.id)}>
            {m.nom_complet}
          </button>
        ))}
      </div>

      {socialesDuMembre.map((s) => (
        <div key={s.id}>
          {formatMoney(s.montant)} - {formatDate(s.date_sociale)}

          {role === "admin" && (
            <div>
              <button onClick={() => handleEdit(s)}>Modifier</button>
              <button onClick={() => handleDelete(s.id)}>Supprimer</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Sociales;