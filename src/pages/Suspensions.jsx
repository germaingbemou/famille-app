import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { formatDate } from "../utils/formatters";

function Suspensions() {
  const [suspensions, setSuspensions] = useState([]);
  const [editingSuspension, setEditingSuspension] = useState(null);

  const [formData, setFormData] = useState({
    date_debut: "",
    date_fin: "",
    type: "toutes",
    commentaire: "",
  });

  useEffect(() => {
    fetchSuspensions();
  }, []);

  async function fetchSuspensions() {
    const { data, error } = await supabase
      .from("suspensions")
      .select("*")
      .order("date_debut", { ascending: false });

    if (error) {
      console.log(error);
    } else {
      setSuspensions(data || []);
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

    let error;

    if (editingSuspension) {
      const response = await supabase
        .from("suspensions")
        .update({
          date_debut: formData.date_debut,
          date_fin: formData.date_fin || null,
          type: formData.type,
          commentaire: formData.commentaire,
        })
        .eq("id", editingSuspension);

      error = response.error;
    } else {
      const response = await supabase
        .from("suspensions")
        .insert([
          {
            date_debut: formData.date_debut,
            date_fin: formData.date_fin || null,
            type: formData.type,
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
        editingSuspension
          ? "Suspension modifiée."
          : "Suspension ajoutée."
      );

      setFormData({
        date_debut: "",
        date_fin: "",
        type: "toutes",
        commentaire: "",
      });

      setEditingSuspension(null);

      fetchSuspensions();
    }
  }

  function handleEdit(suspension) {
    setEditingSuspension(suspension.id);

    setFormData({
      date_debut: suspension.date_debut,
      date_fin: suspension.date_fin || "",
      type: suspension.type,
      commentaire: suspension.commentaire || "",
    });
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Supprimer cette suspension ?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("suspensions")
      .delete()
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("Erreur suppression.");
    } else {
      fetchSuspensions();
    }
  }

  function getStatut(suspension) {
    const today = new Date();

    const debut = new Date(suspension.date_debut);

    const fin = suspension.date_fin
      ? new Date(suspension.date_fin)
      : null;

    if (today < debut) return "À venir";

    if (!fin) return "Active";

    if (today >= debut && today <= fin)
      return "Active";

    return "Terminée";
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">
        Suspensions
      </h2>

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          <input
            type="date"
            name="date_debut"
            value={formData.date_debut}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="date"
            name="date_fin"
            value={formData.date_fin}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          >
            <option value="toutes">
              Cotisations et sociales
            </option>

            <option value="cotisation">
              Cotisations seulement
            </option>

            <option value="sociale">
              Sociales seulement
            </option>
          </select>

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
            {editingSuspension
              ? "Modifier la suspension"
              : "Ajouter la suspension"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-xl font-bold mb-4">
          Liste des suspensions
        </h3>

        {suspensions.length === 0 ? (
          <p>Aucune suspension enregistrée.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {suspensions.map((suspension) => (
              <div
                key={suspension.id}
                className="border rounded-xl p-4 shadow-sm bg-white"
              >
                <p className="font-bold">
                  {suspension.type === "toutes"
                    ? "Cotisations et sociales"
                    : suspension.type ===
                      "cotisation"
                    ? "Cotisations seulement"
                    : "Sociales seulement"}
                </p>

                <p className="text-sm text-gray-600 mt-2">
                  Début :{" "}
                  {formatDate(
                    suspension.date_debut
                  )}
                </p>

                <p className="text-sm text-gray-600">
                  Fin :{" "}
                  {suspension.date_fin
                    ? formatDate(
                        suspension.date_fin
                      )
                    : "Non renseignée"}
                </p>

                <p className="font-semibold mt-2">
                  Statut : {getStatut(suspension)}
                </p>

                {suspension.commentaire && (
                  <p className="text-sm text-gray-500 mt-2">
                    {suspension.commentaire}
                  </p>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(suspension)
                    }
                    className="text-xs bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Modifier
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(suspension.id)
                    }
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Suspensions;