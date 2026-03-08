"""
Image Analysis Sub-Agent for MyBudayaHub.

Uses Gemini 2.5 Flash to analyse uploaded images and return
a short description of their content.
"""

from google.adk.agents import Agent


# ── Sub-agent definition ──────────────────────────────────────────────────

image_agent = Agent(
    name="image_agent",
    # gemini-2.5-flash — optimised for fast multimodal inference.
    model="gemini-2.5-flash",
    description=(
        "Specialist image analysis agent. "
        "Handles PNG, JPG, WEBP, HEIC, GIF and other raster image formats."
    ),
    instruction="""
You are an expert visual analyst.

When given an image (via its Gemini Files API URI), describe the image uploaded in a short sentence.

Respond in structured JSON with the key:
  description

If the image cannot be processed, return {"error": "<reason>"}.
""",
)
