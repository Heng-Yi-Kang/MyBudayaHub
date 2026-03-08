"""
Image analysis & generation service for MyBudayaHub.

- analyse_heritage_image  – uploads a file to the Gemini Files API,
  invokes the image_agent (Gemini 2.5 Flash) and returns a short
  description of the image.
- generate_image_from_description – calls Gemini 2.5 Flash with image
  output modality to generate a comic-style step-by-step guide image.
- summarize_heritage_input – uses Gemini 3.1 Flash Lite to create a
  step-by-step guide based on the user's heritage submission.
"""

import base64
import json
import os
import uuid
from io import BytesIO

from google import genai
from google.genai import types as genai_types
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from PIL import Image

from config import GOOGLE_API_KEY, GENERATED_DIR
from budaya_agent.agent import root_agent


# ── Helpers ────────────────────────────────────────────────────────────────

def _get_genai_client() -> genai.Client:
    """Create and return a Google GenAI client."""
    return genai.Client(api_key=GOOGLE_API_KEY)


# ── 1.  Image Analysis (Gemini 2.5 Flash via ADK) ─────────────────────────

async def analyse_heritage_image(file_path: str) -> dict:
    """
    Analyse an uploaded heritage image by:
    1. Uploading it to the Gemini Files API.
    2. Sending the file URI to the image_agent via the ADK runner.
    3. Returning the structured description (or error).

    Args:
        file_path: Absolute path to the image file on disk.

    Returns:
        A dict with key ``description`` or ``error``.
    """
    if not os.path.isfile(file_path):
        return {"error": f"File not found: {file_path}"}

    client = _get_genai_client()

    # 1. Upload the file to the Gemini Files API
    uploaded_file = client.files.upload(file=file_path)
    file_uri = uploaded_file.uri

    # 2. Build an ADK runner and session to invoke the agent
    session_service = InMemorySessionService()
    runner = Runner(
        agent=root_agent,
        app_name="mybudayahub",
        session_service=session_service,
    )

    session = await session_service.create_session(
        app_name="mybudayahub",
        user_id="backend-service",
    )

    # Construct a user message that includes the file URI
    user_message = genai_types.Content(
        role="user",
        parts=[
            genai_types.Part.from_uri(
                file_uri=file_uri,
                mime_type=uploaded_file.mime_type or "image/png",
            ),
            genai_types.Part.from_text(
                "Describe this heritage image in a short sentence."
            ),
        ],
    )

    # 3. Run and collect the final agent response
    final_text = ""
    async for event in runner.run_async(
        session_id=session.id,
        user_id="backend-service",
        new_message=user_message,
    ):
        if event.is_final_response() and event.content and event.content.parts:
            final_text = "".join(
                p.text for p in event.content.parts if p.text
            )

    # 4. Try to parse structured JSON from the agent's response
    try:
        result = json.loads(final_text)
    except (json.JSONDecodeError, TypeError):
        result = {"description": final_text} if final_text else {
            "error": "No response from image analysis agent."
        }

    return result


# ── 2.  Summarise Heritage Input (Gemini 3.1 Flash Lite) ──────────────────

async def summarize_heritage_input(
    title: str,
    description: str,
    image_analyses: list[dict],
) -> str:
    """
    Use Gemini 3.1 Flash Lite to produce a step-by-step guide based on the
    user's heritage submission (title + description + any AI image analyses).

    The guide walks the reader through how to perform, recreate, or experience
    the described heritage practice.  The output is what the user will review
    and approve before image generation.

    Returns:
        A plain-text step-by-step guide string.
    """
    client = _get_genai_client()

    # Gather image-analysis descriptions
    analysis_texts = []
    for a in image_analyses:
        desc = a.get("description", "")
        if desc:
            analysis_texts.append(desc)

    analysis_block = (
        "\n\nImage analysis results:\n" + "\n".join(f"- {t}" for t in analysis_texts)
        if analysis_texts else ""
    )

    prompt = (
        "You are a cultural heritage documentation assistant.\n"
        "The user submitted the following heritage entry:\n\n"
        f"Title: {title}\n"
        f"Description: {description}"
        f"{analysis_block}\n\n"
        "Based on the information above, produce a clear, numbered "
        "step-by-step guide (5–8 steps) that explains how to perform, "
        "recreate, or experience this cultural heritage practice.\n\n"
        "Rules:\n"
        "- Each step should be a single concise sentence.\n"
        "- Start each step with an action verb.\n"
        "- The guide must be vivid and descriptive enough to serve as a "
        "prompt for generating a comic-style illustration of the steps.\n"
        "- Return ONLY the numbered steps, no extra headers or formatting."
    )

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite-preview",
        contents=prompt,
    )

    summary = ""
    if response.candidates:
        for candidate in response.candidates:
            if candidate.content and candidate.content.parts:
                summary = "".join(
                    p.text for p in candidate.content.parts if p.text
                )

    return summary.strip() if summary else (
        f"{title}: {description}"
    )


# ── 3.  Image Generation (Comic Step-by-Step Guide) ──────────────────────

async def generate_image_from_description(
    description: str,
    title: str = "",
    num_images: int = 1,
) -> list[dict]:
    """
    Generate a comic-style step-by-step guide image using Gemini 2.5 Flash
    with image output capabilities.

    The generated image displays all steps as sequential comic panels in a
    single image, with bold outlines, speech bubbles, and vibrant colours.

    Args:
        description: The step-by-step guide text (numbered steps) produced
                     by the summary agent, possibly edited by the user.
        title:       Optional heritage title for richer prompting.
        num_images:  Number of images to generate (1-4).

    Returns:
        List of dicts with keys: filename, filepath, base64, url.
    """
    client = _get_genai_client()

    # Build a comic-style step-by-step prompt
    prompt = (
        f"Generate a single image that is a comic-style step-by-step "
        f"illustrated guide for the cultural heritage practice: "
        f'"{title}".\n\n'
        f"Steps to illustrate:\n{description}\n\n"
        f"Art direction:\n"
        f"- Use a comic / manga panel layout with numbered panels, one per step.\n"
        f"- Each panel shows the action described in that step with a short caption.\n"
        f"- Bold black outlines, vibrant saturated colours, halftone dot shading.\n"
        f"- Friendly, expressive cartoon characters performing each action.\n"
        f"- Include a large title banner at the top: \"{title}\".\n"
        f"- The overall feel should be fun, educational, and culturally respectful.\n"
        f"- All panels must fit in ONE image."
    ) if title else (
        f"Generate a single image that is a comic-style step-by-step "
        f"illustrated guide.\n\n"
        f"Steps to illustrate:\n{description}\n\n"
        f"Art direction:\n"
        f"- Use a comic / manga panel layout with numbered panels, one per step.\n"
        f"- Each panel shows the action described in that step with a short caption.\n"
        f"- Bold black outlines, vibrant saturated colours, halftone dot shading.\n"
        f"- Friendly, expressive cartoon characters performing each action.\n"
        f"- The overall feel should be fun, educational, and culturally respectful.\n"
        f"- All panels must fit in ONE image."
    )

    num_images = max(1, min(num_images, 4))

    generated_files = []

    for _ in range(num_images):
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=prompt,
            config=genai_types.GenerateContentConfig(
                response_modalities=["IMAGE"],
            ),
        )

        # Extract image parts from the response
        if response.candidates:
            for candidate in response.candidates:
                if candidate.content and candidate.content.parts:
                    for part in candidate.content.parts:
                        if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                            image_bytes = part.inline_data.data
                            image_id = uuid.uuid4().hex[:12]
                            filename = f"heritage_{image_id}.png"
                            filepath = os.path.join(GENERATED_DIR, filename)

                            img = Image.open(BytesIO(image_bytes))
                            img.save(filepath, "PNG")

                            b64_data = base64.b64encode(image_bytes).decode("utf-8")

                            generated_files.append({
                                "filename": filename,
                                "filepath": filepath,
                                "base64": b64_data,
                                "url": f"/generated/{filename}",
                            })

    return generated_files
