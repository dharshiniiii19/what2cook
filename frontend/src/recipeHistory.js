// recipeHistory.js
// Manages recipe history in localStorage: save full recipe objects,
// keep only the latest 20, and provide simple read/delete helpers.

const STORAGE_KEY = "recipe_history_v1";
const MAX_HISTORY = 20;

/**
 * Recipe shape expected (matches the recipe-generation AI output):
 * {
 *   id: string,
 *   name: string,
 *   cuisine: string,
 *   servings: number,
 *   time_minutes: number,
 *   ingredients_have: string[],
 *   ingredients_missing: string[],
 *   steps: string[],
 *   substitutions: [{ missing: string, sub: string }]
 * }
 */

/**
 * Read all saved recipes from history, newest first.
 * Returns [] if nothing saved or if storage is corrupted.
 */
export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to read recipe history:", err);
    return [];
  }
}

/**
 * Save a full recipe object to history.
 * - Adds a saved_at timestamp.
 * - Prepends to the front (newest first).
 * - Trims to MAX_HISTORY entries.
 * - If a recipe with the same id already exists, it's replaced (moved to front)
 *   rather than duplicated.
 */
export function saveToHistory(recipe) {
  if (!recipe || !recipe.id) {
    console.error("saveToHistory: recipe must have an id");
    return getHistory();
  }

  try {
    const current = getHistory();
    const withoutDuplicate = current.filter((r) => r.id !== recipe.id);

    const entry = {
      ...recipe,
      saved_at: new Date().toISOString(),
    };

    const updated = [entry, ...withoutDuplicate].slice(0, MAX_HISTORY);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    // Most likely QuotaExceededError if storage is somehow full.
    console.error("Failed to save recipe to history:", err);
    return getHistory();
  }
}

/**
 * Remove a single recipe from history by id.
 */
export function removeFromHistory(recipeId) {
  try {
    const current = getHistory();
    const updated = current.filter((r) => r.id !== recipeId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to remove recipe from history:", err);
    return getHistory();
  }
}

/**
 * Get a single recipe from history by id, or null if not found.
 */
export function getRecipeById(recipeId) {
  const current = getHistory();
  return current.find((r) => r.id === recipeId) || null;
}

/**
 * Clear all history. Useful for a "clear history" button.
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (err) {
    console.error("Failed to clear recipe history:", err);
    return getHistory();
  }
}