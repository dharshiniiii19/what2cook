// src/components/RecipeDetail.jsx
import { useState } from "react";
import { modifyRecipe } from "../api";

export default function RecipeDetail({ recipe, ingredients, preferences, onSave, onBack, onUpdate }) {
  const [instruction, setInstruction] = useState("");
  const [modifying, setModifying] = useState(false);
  const [error, setError] = useState(null);

  async function handleModify(e) {
    e.preventDefault();
    if (!instruction.trim()) return;

    setModifying(true);
    setError(null);
    try {
      const updated = await modifyRecipe(recipe, ingredients, preferences, instruction);
      onUpdate(updated);
      setInstruction("");
    } catch (err) {
      setError("Couldn't apply that change. Try rephrasing it.");
    } finally {
      setModifying(false);
    }
  }

  return (
    <div className="recipe-detail">
      <button className="back-link" onClick={onBack}>&larr; Back to recipes</button>

      <h2>{recipe.name}</h2>
      <p className="recipe-detail-meta">
        {recipe.cuisine} · {recipe.time_minutes} min · serves {recipe.servings}
      </p>

      <div className="recipe-detail-columns">
        <div>
          <h3>You have</h3>
          <ul>{recipe.ingredients_have.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
        <div>
          <h3>You'll need</h3>
          <ul>
            {recipe.ingredients_missing.length === 0
              ? <li>Nothing — you're set</li>
              : recipe.ingredients_missing.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </div>
      </div>

      <h3>Steps</h3>
      <ol className="recipe-steps">
        {recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
      </ol>

      {recipe.substitutions?.length > 0 && (
        <>
          <h3>Substitutions</h3>
          <ul>
            {recipe.substitutions.map((s, i) => (
              <li key={i}>Instead of {s.missing}, try {s.sub}</li>
            ))}
          </ul>
        </>
      )}

      <form className="modify-form" onSubmit={handleModify}>
        <label htmlFor="modify-instruction">Want to change something?</label>
        <div className="modify-row">
          <input
            id="modify-instruction"
            type="text"
            placeholder='e.g. "make this vegetarian" or "I only have 15 minutes"'
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={modifying}
          />
          <button type="submit" disabled={modifying}>
            {modifying ? "Updating…" : "Update recipe"}
          </button>
        </div>
        {error && <p className="modify-error">{error}</p>}
      </form>

      <button className="save-button" onClick={() => onSave(recipe)}>
        Save to history
      </button>
    </div>
  );
}
