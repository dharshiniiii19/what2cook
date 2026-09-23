// src/api.js
// Thin wrapper around the FastAPI backend endpoints.
// Backend must be running at BASE_URL for these to work.

const BASE_URL = "http://localhost:8000";

/**
 * Send a base64-encoded image (no "data:" prefix) to the backend.
 * Returns { ingredients: [{ name, confidence, quantity_estimate }] }
 */
export async function detectIngredients(imageBase64) {
  const res = await fetch(`${BASE_URL}/detect-ingredients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_base64: imageBase64 }),
  });
  if (!res.ok) throw new Error(`detectIngredients failed: ${res.status}`);
  return res.json();
}

/**
 * ingredients: string[]
 * preferences: { diet, cuisine, max_time_minutes, servings, dietary_restrictions, excluded_ingredients }
 * Returns { recipes: [Recipe, ...] } (5 recipes)
 */
export async function generateRecipes(ingredients, preferences) {
  const res = await fetch(`${BASE_URL}/generate-recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients, preferences }),
  });
  if (!res.ok) throw new Error(`generateRecipes failed: ${res.status}`);
  return res.json();
}

/**
 * recipe: Recipe object being edited
 * ingredients: original ingredient list (string[])
 * preferences: original preferences object
 * instruction: plain-language edit, e.g. "make this vegetarian"
 * Returns updated Recipe object
 */
export async function modifyRecipe(recipe, ingredients, preferences, instruction) {
  const res = await fetch(`${BASE_URL}/modify-recipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipe, ingredients, preferences, instruction }),
  });
  if (!res.ok) throw new Error(`modifyRecipe failed: ${res.status}`);
  return res.json();
}

/** Convert a File (from an <input type="file">) to a base64 string. */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}