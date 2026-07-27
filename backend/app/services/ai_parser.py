from openai import OpenAI
from app.config import settings
from app.schemas.food_log import FoodLogParseResponse

client = OpenAI(api_key=settings.openai_api_key)

SYSTEM_PROMPT = (
    "You estimate nutrition facts for a food log entry from a user's natural "
    "language description. Respond with your best estimate for calories and "
    "macros (grams) for the food described, and infer the meal_type "
    "(breakfast, lunch, dinner, snack) from context if possible. "
    "If you cannot confidently determine a field, set it to null instead of guessing."
)


def parse_food_text(text: str) -> FoodLogParseResponse:
    completion = client.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
        response_format=FoodLogParseResponse,
    )
    return completion.choices[0].message.parsed
