# MyBudayaHub 🏛️
> **Preserving Intangible Cultural Heritage through AI-Powered Comic Chronicles.**

MyBudayaHub is a cutting-edge documentation platform designed to capture and celebrate the world's vanishing traditions. By fusing human storytelling with multi-agent generative AI, the platform transforms descriptions and photos of cultural practices into vibrant, educational step-by-step comic guides.

---

## 🌟 Project Overview

MyBudayaHub addresses the challenge of documenting "intangible" heritage—practices like traditional cooking, weaving, and ritual dances. Instead of static text, it creates **vivid, sequential illustrations** that make these practices accessible to younger generations.

### Key Features
- **Multi-Agent Pipeline**: Specialized AI agents for visual analysis, narrative synthesis, and artistic rendering.
- **Human-in-the-Loop**: Users review and edit AI-generated guides before final comic generation to ensure cultural accuracy.
- **Mission Control UI**: A high-performance dashboard inspired by aerospace telemetry for managing heritage data.
- **Comic-Style Education**: Automatically generated step-by-step guides in a professional comic/manga aesthetic.

---

## 🏗️ Technical Architecture

MyBudayaHub utilizes a **Decoupled Multi-Agent Architecture** to process cultural data with high precision.

### 🧩 The Agentic Flow
1. **The Analyst (Gemini 2.0 Flash)**:  
   Analyzes uploaded images of artifacts or rituals to extract visual metadata, ensuring the AI "sees" the cultural context.
2. **The Scribe (Gemini 3.1 Flash Lite)**:  
   Synthesizes user descriptions and Analyst metadata into a structured, action-oriented step-by-step guide (the "Script").
3. **The Artist (Gemini 2.5 Flash Image)**:  
   Interprets the approved Script into a sequential comic strip, applying specific art direction like halftone shading and vibrant palettes.

### 💻 Tech Stack
- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/).
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+), [Pydantic](https://docs.pydantic.dev/).
- **AI Orchestration**: [Google GenAI SDK](https://github.com/google/generative-ai-python), [Google ADK](https://github.com/google/generative-ai-python).
- **Processing**: [Pillow](https://python-pillow.org/) (Image processing), [Uvicorn](https://www.uvicorn.org/) (ASGI server).

---

## 🧠 Prompt Design & AI Steering

The core of MyBudayaHub lies in its sophisticated prompt engineering process, designed to bridge the gap between abstract culture and concrete visuals.

### 1. Multimodal Synthesis
We don't just send text to the AI. We use **multimodal context steering**:
- **Technique**: Passing Gemini File API URIs alongside user text.
- **Goal**: Allow the model to ground its descriptions in the actual visual evidence provided by the user.

### 2. Zero-Shot Constraint Engineering
To ensure the "Scribe" agent produces usable steps, we use hyper-specific constraints:
- **Steering**: "Start each step with an action verb," "Maximum 12 words per step," "Avoid passive voice."
- **Result**: Highly "drawable" steps that translate perfectly into comic panels.

### 3. Artistic Style Injection
To achieve the signature comic look, the "Artist" agent is steered using a **Style-as-Code** approach:
- **Prompt Tokens**: `halftone dot shading`, `bold black outlines`, `vibrant saturated colours`, `sequential manga panel layout`.
- **Reasoning**: This prevents the "uncanny valley" of realistic AI art, opting instead for an educational, friendly illustration style that feels intentional.

---

## 🚀 Getting Started

### 📦 Prerequisites
- **Python 3.10+** & **Node.js 18+**
- A **Google Gemini API Key** (Get one at [AI Studio](https://aistudio.google.com/app/apikey))

### ⚡ Quick Start (Two Terminals)

**1. Launch the Backend**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Linux/Mac
pip install -r requirements.txt
# Ensure .env has GOOGLE_API_KEY
python main.py
```

**2. Launch the Frontend**
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to start documenting your heritage!

---

## 📄 License
Created for Cultural Preservation. All AI-generated assets are optimized for educational and archival use.
