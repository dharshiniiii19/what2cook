import json
import os
import base64

from groq import AsyncGroq


# Get the API key from .env
client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])


# Groq vision model
# It can handle both images and text and supports JSON output.
VISION_MODEL = "qwen/qwen3.8-27b"

# Text model for recipe generation/modification
TEXT_MODEL = "qwen/qwen3.8-27b"


async def call_vision_ai(image_bytes: bytes) -> dict:
    """
    Detect ingredients from an image.

    Returns:
    {
        "ingredients": [
            {
                "name": "...",
                "confidence": "high/medium/low",
                "quantity_estimate": "..."
            }
        ]
    }
    """

    prompt = (
        "You identify food ingredients visible in a photo of a fridge "
        "or kitchen counter. "
        "Respond with ONLY valid JSON matching exactly this shape: "
        '{"ingredients": [{"name": "string", '
        '"confidence": "high|medium|low", '
        '"quantity_estimate": "string"}]}. '
        "Do not include markdown or any extra text."
    )

    # Convert image bytes into a base64 data URL
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")

    image_url = f"data:image/jpeg;base64,{image_base64}"

    response = await client.chat.completions.create(
        model=VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt,
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_url,
                        },
                    },
                ],
            }
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    return json.loads(response.choices[0].message.content)


async def call_recipe_ai(ingredients: list[str], preferences) -> list[dict]:
    """
    Generate 5 recipes from the available ingredients and preferences.
    """

    prompt = (
        "You are a recipe generator. "
        "Given a list of available ingredients and user preferences, "
        "suggest exactly 5 realistic recipes that can be made. "

        "Respond with ONLY valid JSON. "
        "The JSON must be an object with a 'recipes' key containing "
        "a list of exactly 5 recipe objects. "

        "Each recipe must have this shape: "
        "{"
        '"id": "string", '
        '"name": "string", '
        '"cuisine": "string", '
        '"servings": number, '
        '"time_minutes": number, '
        '"ingredients_have": ["string"], '
        '"ingredients_missing": ["string"], '
        '"steps": ["string"], '
        '"substitutions": ['
        '{"missing": "string", "sub": "string"}'
        "]"
        "}. "

        "No markdown. No explanations outside the JSON.\n\n"

        f"Input: {json.dumps({
            'ingredients': ingredients,
            'preferences': preferences.model_dump()
        })}"
    )

    response = await client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        response_format={"type": "json_object"},
        temperature=0.7,
    )

    result = json.loads(response.choices[0].message.content)

    return result["recipes"]


async def call_modify_ai(
    recipe,
    ingredients: list[str],
    preferences,
    instruction: str,
) -> dict:
    """
    Modify an existing recipe according to the user's instruction.
    """

    prompt = (
        "You modify an existing recipe based on a user's instruction. "
        "Keep the recipe realistic and respect the available ingredients "
        "and user preferences. "

        "Return ONLY valid JSON matching exactly the Recipe shape below: "

        "{"
        '"id": "string", '
        '"name": "string", '
        '"cuisine": "string", '
        '"servings": number, '
        '"time_minutes": number, '
        '"ingredients_have": ["string"], '
        '"ingredients_missing": ["string"], '
        '"steps": ["string"], '
        '"substitutions": ['
        '{"missing": "string", "sub": "string"}'
        "]"
        "}. "

        "Do not include markdown or explanations.\n\n"
    )

    payload = {
        "recipe": recipe.model_dump(),
        "ingredients": ingredients,
        "preferences": preferences.model_dump(),
        "instruction": instruction,
    }

    prompt += f"Input: {json.dumps(payload)}"

    response = await client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        response_format={"type": "json_object"},
        temperature=0.7,
    )

    return json.loads(response.choices[0].message.content)