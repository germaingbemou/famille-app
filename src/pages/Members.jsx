import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { formatMoney } from "../utils/formatters";

function Members() {
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
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
    } else {
      setMembers(data);
    }
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const { error } = await supabase.from("members").insert([
      {
        nom_complet: formData.nom_complet,
        telephone: formData.telephone,
        ville: formData.ville,
        pays: formData.pays,
        montant_cotisation_mensuelle:
          formData.montant_cotisation_mensuelle || 0,
        montant_sociale_mensuelle:
          formData.montant_sociale_mensuelle || 0,
      },
    ]);

    if (error) {
      console.log(error);
      alert("Erreur lors de l'ajout.");
    } else {
      alert("Membre ajouté avec succès.");

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

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            name="nom_complet"
            placeholder="Nom complet"
            value={formData.nom_complet}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="text"
            name="telephone"
            placeholder="Téléphone"
            value={formData.telephone}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="text"
            name="ville"
            placeholder="Ville"
            value={formData.ville}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="text"
            name="pays"
            placeholder="Pays"
            value={formData.pays}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="text"
            inputMode="numeric"
            name="montant_cotisation_mensuelle"
            placeholder="Cotisation mensuelle"
            value={formData.montant_cotisation_mensuelle}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="text"
            inputMode="numeric"
            name="montant_sociale_mensuelle"
            placeholder="Sociale mensuelle"
            value={formData.montant_sociale_mensuelle}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
          >
            Ajouter le membre
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        {members.length === 0 ? (
          <p>Aucun membre trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {members.map((member) => (
              <div
 		 key={member.id}
  		 className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white"
>
                <p className="font-bold text-lg">{member.nom_complet}</p>

                <p className="text-gray-600">{member.telephone}</p>

                <p className="text-gray-500">
                  {member.ville} - {member.pays}
                </p>

                <p className="text-sm text-gray-600 mt-2">
                  Cotisation :{" "}
                  {formatMoney(member.montant_cotisation_mensuelle)}
                </p>

                <p className="text-sm text-gray-600">
                  Sociale : {formatMoney(member.montant_sociale_mensuelle)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Members;