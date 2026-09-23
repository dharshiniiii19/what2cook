"""
FastAPI backend for the AI cooking assistant.

Two endpoints, matching the two AI calls in the flow:
  POST /detect-ingredients   -> vision AI, returns ingredients JSON
  POST /generate-recipes     -> recipe AI, returns 5 recipes JSON
  POST /modify-recipe        -> recipe AI, returns one updated recipe JSON

No database, no auth for v1. The Gemini API key lives only in this server's
environment (.env) and is never sent to the browser.
"""

import base64
import os

from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    DetectIngredientsRequest,
    DetectIngredientsResponse,
    GenerateRecipesRequest,
    GenerateRecipesResponse,
    ModifyRecipeRequest,
    Recipe,
)
from app.ai_client import call_vision_ai, call_recipe_ai, call_modify_ai



app = FastAPI(title="AI Cooking Assistant API")

# Allow your React dev server to call this API.
# Tighten allow_origins to your real frontend domain before deploying.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/detect-ingredients", response_model=DetectIngredientsResponse)
async def detect_ingredients(payload: DetectIngredientsRequest):
    """
    Accepts a JSON body { "image_base64": "..." } (no data: prefix) and
    returns the detected ingredients JSON, per the schema in project
    instructions.
    """
    try:
        image_bytes = base64.b64decode(payload.image_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image data")

    result = await call_vision_ai(image_bytes)
    return result


@app.post("/generate-recipes", response_model=GenerateRecipesResponse)
async def generate_recipes(payload: GenerateRecipesRequest):
    """
    Takes the confirmed ingredient list + user preferences,
    returns 5 recipe objects matching the shared Recipe schema.
    """
    recipes = await call_recipe_ai(
        ingredients=payload.ingredients,
        preferences=payload.preferences,
    )
    return GenerateRecipesResponse(recipes=recipes)


@app.post("/modify-recipe", response_model=Recipe)
async def modify_recipe(payload: ModifyRecipeRequest):
    """
    Takes an existing recipe + the original context + a plain-language
    edit instruction (e.g. "make this vegetarian"), returns the updated
    recipe in the same schema.
    """
    updated = await call_modify_ai(
        recipe=payload.recipe,
        ingredients=payload.ingredients,
        preferences=payload.preferences,
        instruction=payload.instruction,
    )
    return updated


@app.get("/health")
async def health():
    return {"status": "ok"}