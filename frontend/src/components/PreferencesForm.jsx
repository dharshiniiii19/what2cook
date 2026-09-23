// src/components/PreferencesForm.jsx
import { useState } from "react";

const DEFAULTS = {
  diet: "non-vegetarian",
  cuisine: "",
  max_time_minutes: 30,
  servings: 2,
  dietary_restrictions: "",
  excluded_ingredients: "",
};

export default function PreferencesForm({ onSubmit, loading }) {
  const [form, setForm] = useState(DEFAULTS);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      diet: form.diet,
      cuisine: form.cuisine.trim() || "any",
      max_time_minutes: Number(form.max_time_minutes),
      servings: Number(form.servings),
      dietary_restrictions: form.dietary_restrictions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      excluded_ingredients: form.excluded_ingredients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  }

  return (
    <form className="prefs-form" onSubmit={handleSubmit}>
      <h2 className="prefs-title">What are you in the mood for?</h2>

      <div className="prefs-row">
        <label>
          Diet
          <select value={form.diet} onChange={(e) => update("diet", e.target.value)}>
            <option value="vegetarian">Vegetarian</option>
            <option value="non-vegetarian">Non-vegetarian</option>
          </select>
        </label>

        <label>
          Cuisine
          <input
            type="text"
            placeholder="Any"
            value={form.cuisine}
            onChange={(e) => update("cuisine", e.target.value)}
          />
        </label>
      </div>

      <div className="prefs-row">
        <label>
          Max cooking time (minutes)
          <input
            type="number"
            min="5"
            value={form.max_time_minutes}
            onChange={(e) => update("max_time_minutes", e.target.value)}
          />
        </label>

        <label>
          Servings
          <input
            type="number"
            min="1"
            value={form.servings}
            onChange={(e) => update("servings", e.target.value)}
          />
        </label>
      </div>

      <label>
        Dietary restrictions (comma separated)
        <input
          type="text"
          placeholder="e.g. gluten-free, low-carb"
          value={form.dietary_restrictions}
          onChange={(e) => update("dietary_restrictions", e.target.value)}
        />
      </label>

      <label>
        Ingredients to avoid (comma separated)
        <input
          type="text"
          placeholder="e.g. onions, mushrooms"
          value={form.excluded_ingredients}
          onChange={(e) => update("excluded_ingredients", e.target.value)}
        />
      </label>

      <button type="submit" disabled={loading} className="prefs-submit">
        {loading ? "Finding recipes…" : "Find recipes"}
      </button>
    </form>
  );
}
