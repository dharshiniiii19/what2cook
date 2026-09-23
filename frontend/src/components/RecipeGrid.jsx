// src/components/RecipeGrid.jsx
export default function RecipeGrid({ recipes, onSelect }) {
  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => (
        <button
          key={recipe.id}
          className="recipe-card"
          onClick={() => onSelect(recipe)}
        >
          <h3>{recipe.name}</h3>
          <p className="recipe-card-meta">
            {recipe.cuisine} · {recipe.time_minutes} min · serves {recipe.servings}
          </p>
          <p className="recipe-card-missing">
            {recipe.ingredients_missing.length === 0
              ? "You have everything"
              : `Missing: ${recipe.ingredients_missing.join(", ")}`}
          </p>
        </button>
      ))}
    </div>
  );
}
