# The Story of MyBudayaHub 🏮

## ## Inspiration
The vibrant tapestry of our cultural heritage is fraying. While buildings and artifacts (tangible heritage) are physically preserved, the *soul* of culture—the recipes, the craftsmanship, the oral traditions (**intangible heritage**)—is disappearing as older generations pass away. 

We wanted to build a bridge between the wisdom of the past and the digital language of the future. We asked ourselves: *"How can we make cultural documentation as engaging as a comic book?"* Our goal was to turn "old-fashioned" archive work into an interactive, AI-driven experience that excites younger generations about their roots.

## ## What it does
MyBudayaHub is an AI-powered documentation suite that transforms memories into visual guides. 
- **Submit**: A user provides a title, description, and photos of a heritage practice (e.g., traditional weaving, a ritual dance, or a family recipe). 
- **Analyze**: The system's **Analyst Agent** (Gemini 2.5 Flash) scans the uploads to extract visual metadata and cultural nuances.
- **Synthesize**: The **Scribe Agent** (Gemini 3.1 Flash Lite) takes the user's story and the analyst's data to draft a 5-8 step educational guide.
- **Verify**: The user reviews and polishes the steps to ensure absolute cultural accuracy (Human-in-the-Loop).
- **Visualize**: The **Artist Agent** (Gemini 2.5 Flash Image) renders a professional-grade comic strip illustrating the entire process in a high-contrast, educational format.

## ## How we built it
- **Orchestration**: We utilized a **Decoupled Multi-Agent Architecture**. The **Google ADK** was instrumental in managing the Analyst agent's lifecycle and memory.
- **Intelligence Stack**: We leveraged a specialized trio of Gemini models:
    - **Gemini 2.5 Flash**: High-speed visual analysis of heritage artifacts.
    - **Gemini 3.1 Flash Lite**: Cost-effective, high-precision synthesis of narrative steps.
    - **Gemini 2.5 Flash Image**: High-fidelity artistic rendering with image output modality.
- **Frontend**: A **"Mission Control" Dashboard** built with **Next.js 16** and **Tailwind CSS 4**. We chose a dark-mode, neon-accented aesthetic to signify that cultural documentation is a high-tech mission for the future.
- **Backend**: A modern **FastAPI** server that manages the state machine of heritage submissions, AI analysis, and asset serving.

## ## Challenges we ran into
- **Multimodal Data Flow**: Passing the Analyst agent's visual findings to the Scribe agent required a robust "context-passing" logic to ensure the written steps matched the uploaded photos.
- **Comic Panel Consistency**: Getting an image generation model to respect a "sequential panel" layout in a single image required extensive prompt engineering and constraint-based steering.
- **Real-time State Management**: Building a UI that updates as the "Analyst" and "Scribe" finish their work, while waiting for user approval, required a carefully designed polling and status system.

## ## Accomplishments that we're proud of
- **True Human-in-the-Loop**: We successfully implemented a workflow where AI does the heavy lifting, but the human maintains ultimate control over the cultural narrative before final rendering.
- **Premium Aesthetic**: We moved beyond a simple CRUD app to create a dashboard that feels state-of-the-art and important.
- **Zero-Shot Artistic Direction**: Achieving a consistent "halftone comic" style across different culture types (food vs. dance) without needing fine-tuned models.

## ## What we learned
- **The Value of Agent Specialization**: We learned that breaking the task into "Analyst", "Scribe", and "Artist" roles produces significantly higher quality than asking one general model to handle the entire pipeline.
- **Prompt-Driven UX**: We discovered that specific linguistic constraints (like "start with an action verb") are the most effective way to "program" image models.
- **Cultural Sensitivity**: Building this project highlighted the importance of accuracy in documentation—leading us to prioritize the user-approval step as a core feature rather than an afterthought.

## ## What's next for MyBudayaHub
- **Multi-Page Chronicles**: Moving from single-page comic strips to full-length "Heritage Books."
- **AR Heritage Viewer**: Using the generated steps to overlay 3D visual guides in the real world via Augmented Reality.
- **Vocal Archives**: Integrating traditional music and dialect recording to capture the rhythmic and linguistic soul of the heritage.
- **Global Heritage Map**: A public gallery where these AI-captured traditions can be pinned to a map and shared with researchers worldwide.
