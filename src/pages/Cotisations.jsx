import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { formatDate, formatMoney } from "../utils/formatters";

function Cotisations({ role }) {
  const [members, setMembers] = useState([]);
  const [cotisations, setCotisations] = useState([]);
  const [sociales, setSociales] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [editingCotisation, setEditingCotisation] = useState(null);

  const [formData, setFormData] = useState({
    member_id: "",
    date_cotisation: "",
    montant: "",
    commentaire: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: membersData } = await supabase
      .from("members")
      .select("*")
      .order("nom_complet");

    const { data: cotisationsData } = await supabase
      .from("cotisations")
      .select(`*, members (nom_complet)`)
      .order("date_cotisation", { ascending: false });

    const { data: socialesData } = await supabase
      .from("sociales")
      .select(`*, members (nom_complet)`)
      .order("date_sociale", { ascending: false });

    setMembers(membersData || []);
    setCotisations(cotisationsData || []);
    setSociales(socialesData || []);
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

    if (editingCotisation) {
      const response = await supabase
        .from("cotisations")
        .update({
          member_id: formData.member_id,
          date_cotisation: formData.date_cotisation,
          montant: formData.montant,
          commentaire: formData.commentaire,
        })
        .eq("id", editingCotisation);

      error = response.error;
    } else {
      const response = await supabase.from("cotisations").insert([
        {
          member_id: formData.member_id,
          date_cotisation: formData.date_cotisation,
          montant: formData.montant,
          commentaire: formData.commentaire,
        },
      ]);

      error = response.error;
    }

    if (error) {
      console.log(error);
      alert("Erreur lors de l'enregistrement.");
    } else {
      alert(
        editingCotisation
          ? "Cotisation modifiée."
          : "Cotisation ajoutée."
      );

      setFormData({
        member_id: "",
        date_cotisation: "",
        montant: "",
        commentaire: "",
      });

      setEditingCotisation(null);
      await fetchData();
    }
  }

  function handleEdit(cotisation) {
    setEditingCotisation(cotisation.id);

    setFormData({
      member_id: cotisation.member_id,
      date_cotisation: cotisation.date_cotisation,
      montant: cotisation.montant,
      commentaire: cotisation.commentaire || "",
    });
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm("Supprimer cette cotisation ?");

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("cotisations")
      .delete()
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("Erreur suppression.");
    } else {
      await fetchData();
    }
  }

  function totalCotisationsMembre(memberId) {
    return cotisations
      .filter((c) => c.member_id === memberId)
      .reduce((sum, item) => sum + Number(item.montant), 0);
  }

  function totalSocialesMembre(memberId) {
    return sociales
      .filter((s) => s.member_id === memberId)
      .reduce((sum, item) => sum + Number(item.montant), 0);
  }

  const selectedMember = members.find(
    (member) => member.id === selectedMemberId
  );

  const cotisationsDuMembre = selectedMemberId
    ? cotisations.filter((c) => c.member_id === selectedMemberId)
    : [];

  const socialesDuMembre = selectedMemberId
    ? sociales.filter((s) => s.member_id === selectedMemberId)
    : [];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Cotisations</h2>

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

            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.nom_complet}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="date_cotisation"
            value={formData.date_cotisation}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="text"
            inputMode="numeric"
            name="montant"
            placeholder="Montant"
            value={formData.montant}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="text"
            name="commentaire"
            placeholder="Commentaire"
            value={formData.commentaire}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
          >
            {editingCotisation
              ? "Modifier la cotisation"
              : "Ajouter la cotisation"}
          </button>
        </form>
      </div>
)}

      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h3 className="text-xl font-bold mb-4">Résumé par membre</h3>

        {members.length === 0 ? (
          <p>Aucun membre trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {members.map((member) => {
              const totalCotisations = totalCotisationsMembre(member.id);
              const totalSociales = totalSocialesMembre(member.id);
              const totalGeneral = totalCotisations + totalSociales;

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`cursor-pointer text-left border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white ${
                    selectedMemberId === member.id
                      ? "border-blue-600 ring-2 ring-blue-200"
                      : ""
                  }`}
                >
                  <p className="font-bold text-lg mb-2">
                    {member.nom_complet}
                  </p>

                  <p className="text-sm text-gray-600">
                    Cotisations : {formatMoney(totalCotisations)}
                  </p>

                  <p className="text-sm text-gray-600">
                    Sociales : {formatMoney(totalSociales)}
                  </p>

                  <p className="font-semibold mt-2">
                    Total : {formatMoney(totalGeneral)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedMember && (
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-xl font-bold mb-4">
            Historique de {selectedMember.nom_complet}
          </h3>

         <div>



            <div>
              <h4 className="font-bold mb-3">Cotisations</h4>

              {cotisationsDuMembre.length === 0 ? (
                <p>Aucune cotisation pour ce membre.</p>
              ) : (

<div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-8 gap-3">
                  {cotisationsDuMembre.map((cotisation) => (
                    <div
                      key={cotisation.id}
                      className="border rounded-lg p-2 text-sm bg-slate-50 hover:bg-slate-100 transition"
                    >
                      <p className="font-bold">
                        {formatMoney(cotisation.montant)}
                      </p>

                      <p className="text-gray-500">
                        {formatDate(cotisation.date_cotisation)}
                      </p>

                      {cotisation.commentaire && (
                        <p className="text-gray-600 mt-1">
                          {cotisation.commentaire}
                        </p>
                      )}

{role === "admin" && (
  <div className="flex gap-2 mt-2">                    

                        <button
                          type="button"
                          onClick={() => handleEdit(cotisation)}
                          className="text-xs bg-yellow-500 text-white px-2 py-1 rounded"
                        >
                          Modifier
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(cotisation.id)}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Supprimer
                        </button>
)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

      
          </div>
        </div>
      )}
    </div>
  );
}

export default Cotisations;