"""
Pydantic models mirroring the JSON schemas in the project's Instructions.
Keep these in sync if the schema in Instructions ever changes.
"""

from typing import Literal, Optional

from pydantic import BaseModel


# ---- Ingredient detection ----

class DetectIngredientsRequest(BaseModel):
    image_base64: str


class DetectedIngredient(BaseModel):
    name: str
    confidence: Literal["high", "medium", "low"]
    quantity_estimate: str


class DetectIngredientsResponse(BaseModel):
    ingredients: list[DetectedIngredient]


# ---- Preferences (from the preferences form) ----

class Preferences(BaseModel):
    diet: Literal["vegetarian", "non-vegetarian"]
    cuisine: str
    max_time_minutes: int
    servings: int
    dietary_restrictions: list[str] = []
    excluded_ingredients: list[str] = []


# ---- Recipe ----

class Substitution(BaseModel):
    missing: str
    sub: str


class Recipe(BaseModel):
    id: str
    name: str
    cuisine: str
    servings: int
    time_minutes: int
    ingredients_have: list[str]
    ingredients_missing: list[str]
    steps: list[str]
    substitutions: list[Substitution] = []
    saved_at: Optional[str] = None  # set by frontend on save, not by AI


# ---- Requests / responses ----

class GenerateRecipesRequest(BaseModel):
    ingredients: list[str]
    preferences: Preferences


class GenerateRecipesResponse(BaseModel):
    recipes: list[Recipe]


class ModifyRecipeRequest(BaseModel):
    recipe: Recipe
    ingredients: list[str]
    preferences: Preferences
    instruction: str