// src/components/IngredientChips.jsx
import { useState } from "react";

export default function IngredientChips({ ingredients, onChange }) {
  const [newItem, setNewItem] = useState("");

  function removeIngredient(name) {
    onChange(ingredients.filter((i) => i !== name));
  }

  function addIngredient() {
    const trimmed = newItem.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      onChange([...ingredients, trimmed]);
    }
    setNewItem("");
  }

  return (
    <div className="chips-panel">
      <h2 className="chips-title">Here's what we found — fix anything that's wrong</h2>
      <ul className="chips-list">
        {ingredients.map((name) => (
          <li key={name} className="chip">
            {name}
            <button
              type="button"
              className="chip-remove"
              aria-label={`Remove ${name}`}
              onClick={() => removeIngredient(name)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="chips-add">
        <input
          type="text"
          value={newItem}
          placeholder="Add an ingredient"
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
        />
        <button type="button" onClick={addIngredient}>Add</button>
      </div>
    </div>
  );
}
