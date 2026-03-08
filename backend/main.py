"""
MyBudayaHub Backend - Intangible Cultural Heritage Documentation Platform.

FastAPI backend that:
- Receives heritage submissions (title, description, files)
- Analyses uploaded images using the Gemini-based image agent
- Generates a step-by-step guide for the heritage practice
- Waits for user approval of the guide
- Generates a comic-style step-by-step illustration upon approval
- Serves uploaded and generated files
"""

import os
import uuid
import shutil
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from config import UPLOAD_DIR, GENERATED_DIR, HOST, PORT
from image_service import analyse_heritage_image, generate_image_from_description, summarize_heritage_input


# ── App setup ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="MyBudayaHub API",
    description="API for documenting intangible cultural heritage with AI imagery",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated images as static files
app.mount("/generated", StaticFiles(directory=GENERATED_DIR), name="generated")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ── In-memory store (replace with DB in production) ───────────────────────

heritage_store: dict[str, dict] = {}


# ── Models ─────────────────────────────────────────────────────────────────

class HeritageResponse(BaseModel):
    id: str
    title: str
    description: str
    uploaded_files: list[dict]
    image_analysis: list[dict]
    generated_images: list[dict]
    ai_summary: str = ""             # Gemini-generated summary for user review
    status: str                     # "pending_approval" | "approved" | "generating" | "complete"
    created_at: str


class HeritageListItem(BaseModel):
    id: str
    title: str
    description: str
    uploaded_files_count: int
    image_analysis_count: int
    generated_images_count: int
    status: str
    thumbnail: Optional[str] = None
    created_at: str


# ── Routes ─────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "name": "MyBudayaHub API",
        "version": "1.0.0",
        "description": "Intangible Cultural Heritage Documentation Platform",
    }


@app.post("/api/heritage", response_model=HeritageResponse)
async def create_heritage(
    title: str = Form(...),
    description: str = Form(...),
    files: list[UploadFile] = File(default=[]),
):
    """
    Submit a new intangible cultural heritage entry.

    Step 1 of the two-step flow:
    - Saves uploaded files
    - Analyses uploaded images via the Gemini-based image agent
    - Returns a description for user approval

    The entry is created with status "pending_approval".
    """
    heritage_id = uuid.uuid4().hex[:16]
    entry_upload_dir = os.path.join(UPLOAD_DIR, heritage_id)
    os.makedirs(entry_upload_dir, exist_ok=True)

    # Save uploaded files
    uploaded_files = []
    for file in files:
        if file.filename:
            safe_name = f"{uuid.uuid4().hex[:8]}_{file.filename}"
            file_path = os.path.join(entry_upload_dir, safe_name)
            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)

            uploaded_files.append({
                "original_name": file.filename,
                "saved_name": safe_name,
                "url": f"/uploads/{heritage_id}/{safe_name}",
                "content_type": file.content_type or "application/octet-stream",
                "size": len(content),
            })

    # Analyse uploaded images using the Gemini-based image agent
    image_analysis = []
    for uf in uploaded_files:
        if uf.get("content_type", "").startswith("image/"):
            file_path = os.path.join(UPLOAD_DIR, heritage_id, uf["saved_name"])
            try:
                result = await analyse_heritage_image(file_path)
                result["source_file"] = uf["original_name"]
                image_analysis.append(result)
            except Exception as e:
                print(f"[WARNING] Image analysis failed for {uf['original_name']}: {e}")
                image_analysis.append({"error": str(e), "source_file": uf["original_name"]})

    # Generate step-by-step guide via Gemini 3.1 Flash Lite
    try:
        ai_summary = await summarize_heritage_input(
            title=title,
            description=description,
            image_analyses=image_analysis,
            uploaded_files=uploaded_files,
        )
    except Exception as e:
        print(f"[WARNING] Step-by-step guide generation failed: {e}")
        ai_summary = description  # fallback to raw description

    # Save entry to store — status = pending_approval
    entry = {
        "id": heritage_id,
        "title": title,
        "description": description,
        "uploaded_files": uploaded_files,
        "image_analysis": image_analysis,
        "generated_images": [],
        "ai_summary": ai_summary,
        "status": "pending_approval",
        "created_at": datetime.now().isoformat(),
    }
    heritage_store[heritage_id] = entry

    return HeritageResponse(**entry)


class ApproveRequest(BaseModel):
    approved_summary: str = ""  # The summary the user approved (possibly edited)


@app.post("/api/heritage/{heritage_id}/approve", response_model=HeritageResponse)
async def approve_heritage(heritage_id: str, body: ApproveRequest | None = None):
    """
    Step 2: User approves the AI-generated step-by-step guide.

    - Uses the approved guide as the prompt for comic-style image generation
    - Falls back to the stored AI guide if none is provided
    - Generates a comic-style step-by-step illustration
    - Updates the entry status to "complete"
    """
    if heritage_id not in heritage_store:
        raise HTTPException(status_code=404, detail="Heritage entry not found")

    entry = heritage_store[heritage_id]

    if entry["status"] not in ("pending_approval",):
        raise HTTPException(
            status_code=400,
            detail=f"Entry is already '{entry['status']}'. Can only approve entries with status 'pending_approval'.",
        )

    entry["status"] = "generating"

    # Use the approved summary (possibly edited by the user) as the prompt
    approved_summary = (
        body.approved_summary.strip() if body and body.approved_summary.strip()
        else entry.get("ai_summary", entry["description"])
    )
    entry["ai_summary"] = approved_summary  # persist the final approved version

    # Generate image from the approved summary
    try:
        generated_images = await generate_image_from_description(
            description=approved_summary,
            title=entry["title"],
            num_images=1,
        )
        entry["generated_images"] = generated_images
        entry["status"] = "complete"
    except Exception as e:
        print(f"[WARNING] Image generation failed: {e}")
        entry["generated_images"] = [{"error": str(e)}]
        entry["status"] = "complete"

    return HeritageResponse(**entry)


@app.get("/api/heritage", response_model=list[HeritageListItem])
async def list_heritage():
    """List all documented cultural heritage entries."""
    items = []
    for entry in heritage_store.values():
        thumbnail = None
        # Prefer generated image, fallback to uploaded image
        if entry["generated_images"] and "url" in entry["generated_images"][0]:
            thumbnail = entry["generated_images"][0]["url"]
        else:
            for uf in entry["uploaded_files"]:
                if uf.get("content_type", "").startswith("image/"):
                    thumbnail = uf["url"]
                    break

        items.append(HeritageListItem(
            id=entry["id"],
            title=entry["title"],
            description=entry["description"],
            uploaded_files_count=len(entry["uploaded_files"]),
            image_analysis_count=len(entry.get("image_analysis", [])),
            generated_images_count=len(entry.get("generated_images", [])),
            status=entry.get("status", "complete"),
            thumbnail=thumbnail,
            created_at=entry["created_at"],
        ))
    return items


@app.get("/api/heritage/{heritage_id}", response_model=HeritageResponse)
async def get_heritage(heritage_id: str):
    """Get details of a specific cultural heritage entry."""
    if heritage_id not in heritage_store:
        raise HTTPException(status_code=404, detail="Heritage entry not found")
    entry = heritage_store[heritage_id]
    return HeritageResponse(**entry)


@app.delete("/api/heritage/{heritage_id}")
async def delete_heritage(heritage_id: str):
    """Delete a cultural heritage entry and its files."""
    if heritage_id not in heritage_store:
        raise HTTPException(status_code=404, detail="Heritage entry not found")

    # Clean up uploaded files
    entry_upload_dir = os.path.join(UPLOAD_DIR, heritage_id)
    if os.path.exists(entry_upload_dir):
        shutil.rmtree(entry_upload_dir)

    # Clean up generated images
    entry = heritage_store[heritage_id]
    for img in entry.get("generated_images", []):
        filepath = img.get("filepath")
        if filepath and os.path.exists(filepath):
            os.remove(filepath)

    del heritage_store[heritage_id]
    return {"message": "Heritage entry deleted successfully"}


# ── Run ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", PORT))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
