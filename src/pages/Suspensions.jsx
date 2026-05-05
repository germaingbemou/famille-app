import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function Suspensions({ role }) {
  const [suspensions, setSuspensions] = useState([]);
  const [editing, setEditing] = useState(null);

  const [formData, setFormData] = useState({
    date_debut: "",
    date_fin: "",
    type: "toutes",
    commentaire: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase.from("suspensions").select("*");
    setSuspensions(data || []);
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (editing) {
      await supabase
        .from("suspensions")
        .update(formData)
        .eq("id", editing);
    } else {
      await supabase.from("suspensions").insert([formData]);
    }

    setFormData({
      date_debut: "",
      date_fin: "",
      type: "toutes",
      commentaire: "",
    });

    setEditing(null);
    fetchData();
  }

  function handleEdit(s) {
    setEditing(s.id);
    setFormData(s);
  }

  async function handleDelete(id) {
    await supabase.from("suspensions").delete().eq("id", id);
    fetchData();
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Suspensions</h2>

      {role === "admin" && (
        <form onSubmit={handleSubmit}>
          <input type="date" name="date_debut" onChange={handleChange} />
          <input type="date" name="date_fin" onChange={handleChange} />
          <input name="commentaire" onChange={handleChange} />
          <button>Enregistrer</button>
        </form>
      )}

      {suspensions.map((s) => (
        <div key={s.id}>
          {s.date_debut} → {s.date_fin}

          {role === "admin" && (
            <>
              <button onClick={() => handleEdit(s)}>Modifier</button>
              <button onClick={() => handleDelete(s.id)}>Supprimer</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default Suspensions;