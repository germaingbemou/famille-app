import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { formatMoney } from "../utils/formatters";

function Members({ role }) {
  const [members, setMembers] = useState([]);

  const [formData, setFormData] = useState({
    nom_complet: "",
    telephone: "",
    ville: "",
    pays: "",
    montant_cotisation_mensuelle: "",
    montant_sociale_mensuelle: "",
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    const { data } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    setMembers(data || []);
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const { error } = await supabase.from("members").insert([formData]);

    if (error) {
      alert("Erreur");
    } else {
      alert("Membre ajouté");
      setFormData({
        nom_complet: "",
        telephone: "",
        ville: "",
        pays: "",
        montant_cotisation_mensuelle: "",
        montant_sociale_mensuelle: "",
      });
      fetchMembers();
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Membres</h2>

      {role === "admin" && (
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input name="nom_complet" placeholder="Nom" value={formData.nom_complet} onChange={handleChange} className="border p-3 rounded-lg" required />
            <input name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} className="border p-3 rounded-lg" />
            <input name="ville" placeholder="Ville" value={formData.ville} onChange={handleChange} className="border p-3 rounded-lg" />
            <input name="pays" placeholder="Pays" value={formData.pays} onChange={handleChange} className="border p-3 rounded-lg" />
            <input name="montant_cotisation_mensuelle" placeholder="Cotisation" value={formData.montant_cotisation_mensuelle} onChange={handleChange} className="border p-3 rounded-lg" />
            <input name="montant_sociale_mensuelle" placeholder="Sociale" value={formData.montant_sociale_mensuelle} onChange={handleChange} className="border p-3 rounded-lg" />

            <button className="bg-blue-600 text-white p-3 rounded-lg">
              Ajouter
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-5">
        {members.map((m) => (
          <div key={m.id} className="border p-4 rounded mb-3">
            <p className="font-bold">{m.nom_complet}</p>
            <p>{formatMoney(m.montant_cotisation_mensuelle)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Members;