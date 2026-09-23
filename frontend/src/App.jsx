// src/App.jsx
import { useState } from "react";
import { detectIngredients, generateRecipes } from "./api";
import { saveToHistory } from "./recipeHistory";
import ImageUpload from "./components/ImageUpload";
import IngredientChips from "./components/IngredientChips";
import PreferencesForm from "./components/PreferencesForm";
import RecipeGrid from "./components/RecipeGrid";
import RecipeDetail from "./components/RecipeDetail";
import "./styles.css";

// Steps in order, matching the flow diagram:
// upload -> confirm -> preferences -> recipes -> detail
const STEPS = ["upload", "confirm", "preferences", "recipes", "detail"];

export default function App() {
  const [step, setStep] = useState("upload");
  const [ingredients, setIngredients] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedMessage, setSavedMessage] = useState(null);

  async function handleDetect(imageBase64) {
    setLoading(true);
    setError(null);
    try {
      const result = await detectIngredients(imageBase64);
      setIngredients(result.ingredients.map((i) => i.name));
      setStep("confirm");
    } catch (err) {
      setError("Couldn't read the ingredients in that photo. Try again or add them manually.");
      setIngredients([]);
      setStep("confirm");
    } finally {
      setLoading(false);
    }
  }

  async function handlePreferences(prefs) {
    setPreferences(prefs);
    setLoading(true);
    setError(null);
    try {
      const result = await generateRecipes(ingredients, prefs);
      setRecipes(result.recipes);
      setStep("recipes");
    } catch (err) {
      setError("Couldn't generate recipes right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectRecipe(recipe) {
    setSelectedRecipe(recipe);
    setStep("detail");
  }

  function handleSaveRecipe(recipe) {
    saveToHistory(recipe);
    setSavedMessage(`Saved "${recipe.name}" to your history.`);
    setTimeout(() => setSavedMessage(null), 3000);
  }

  function handleUpdateRecipe(updated) {
    setSelectedRecipe(updated);
    setRecipes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  function startOver() {
    setStep("upload");
    setIngredients([]);
    setPreferences(null);
    setRecipes([]);
    setSelectedRecipe(null);
    setError(null);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>What2Cook</h1>
        {step !== "upload" && (
          <button className="start-over" onClick={startOver}>Start over</button>
        )}
      </header>

      {error && <p className="app-error">{error}</p>}
      {savedMessage && <p className="app-saved">{savedMessage}</p>}

      {step === "upload" && (
        <ImageUpload onDetect={handleDetect} loading={loading} />
      )}

      {step === "confirm" && (
        <>
          <IngredientChips ingredients={ingredients} onChange={setIngredients} />
          <button
            className="continue-button"
            onClick={() => setStep("preferences")}
            disabled={ingredients.length === 0}
          >
            Continue
          </button>
        </>
      )}

      {step === "preferences" && (
        <PreferencesForm onSubmit={handlePreferences} loading={loading} />
      )}

      {step === "recipes" && (
        <RecipeGrid recipes={recipes} onSelect={handleSelectRecipe} />
      )}

      {step === "detail" && selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          ingredients={ingredients}
          preferences={preferences}
          onSave={handleSaveRecipe}
          onUpdate={handleUpdateRecipe}
          onBack={() => setStep("recipes")}
        />
      )}
    </div>
  );
}
