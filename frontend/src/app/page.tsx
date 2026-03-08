"use client";

import { useState, useRef, useCallback, useMemo } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Types ─────────────────────────────────────────────────────────────────
interface UploadedFile {
  original_name: string;
  saved_name: string;
  url: string;
  content_type: string;
  size: number;
}

interface GeneratedImage {
  filename?: string;
  base64?: string;
  url?: string;
  error?: string;
}

interface ImageAnalysis {
  description?: string;
  source_file?: string;
  error?: string;
}

interface HeritageEntry {
  id: string;
  title: string;
  description: string;
  uploaded_files: UploadedFile[];
  image_analysis: ImageAnalysis[];
  generated_images: GeneratedImage[];
  ai_summary: string;
  status: "pending_approval" | "approved" | "generating" | "complete";
  created_at: string;
}

// ── Icons (inline SVG) ────────────────────────────────────────────────────
function IconUpload() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconSparkles() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconAudio() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconVideo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function IconBrain() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A5.5 5.5 0 0 0 4 7.5c0 1.5.5 2.8 1.3 3.8A5.5 5.5 0 0 0 4 15c0 3 2.5 5.5 5.5 5.5.7 0 1.4-.1 2-.4" />
      <path d="M14.5 2A5.5 5.5 0 0 1 20 7.5c0 1.5-.5 2.8-1.3 3.8A5.5 5.5 0 0 1 20 15c0 3-2.5 5.5-5.5 5.5-.7 0-1.4-.1-2-.4" />
      <path d="M12 2v20" />
    </svg>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MY", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Main Page Component ───────────────────────────────────────────────────
export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<HeritageEntry[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingSummary, setEditingSummary] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  // Combine all files for submission
  const allFiles = useMemo(() => [...imageFiles, ...audioFiles, ...videoFiles, ...documentFiles], [imageFiles, audioFiles, videoFiles, documentFiles]);

  const showToast = useCallback((type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const handleMediaFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File[]>>
  ) => {
    if (e.target.files) {
      setter((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeMediaFile = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<File[]>>
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent, zone: string) => {
    e.preventDefault();
    setDragOverZone(zone);
  };

  const handleDragLeave = () => {
    setDragOverZone(null);
  };

  const handleDrop = (
    e: React.DragEvent,
    setter: React.Dispatch<React.SetStateAction<File[]>>,
    acceptPrefixes: string | string[]
  ) => {
    e.preventDefault();
    setDragOverZone(null);
    if (e.dataTransfer.files) {
      const prefixes = Array.isArray(acceptPrefixes) ? acceptPrefixes : [acceptPrefixes];
      const validFiles = Array.from(e.dataTransfer.files).filter((f) =>
        prefixes.some((p) => f.type.startsWith(p))
      );
      if (validFiles.length > 0) {
        setter((prev) => [...prev, ...validFiles]);
      } else {
        const labels = prefixes.map(p => p.replace("/", ""));
        showToast("error", `Please drop ${labels.join(" or ")} files only.`);
      }
    }
  };

  // ── Step 1: Submit & Analyse ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      showToast("error", "Please fill in the title and description.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      allFiles.forEach((file) => formData.append("files", file));

      const res = await fetch(`${API_URL}/api/heritage`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data: HeritageEntry = await res.json();
      setSubmissions((prev) => [data, ...prev]);
      setTitle("");
      setDescription("");
      setImageFiles([]);
      setAudioFiles([]);
      setVideoFiles([]);
      setDocumentFiles([]);

      if (data.image_analysis.length > 0) {
        showToast("info", "AI has analysed your images! Review the description below and approve to generate artwork.");
      } else {
        showToast("success", "Heritage entry submitted successfully!");
      }

      // Scroll to results
      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (err) {
      showToast("error", `Submission failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 2: Approve & Generate ───────────────────────────────────────
  const handleApprove = async (heritageId: string) => {
    setApprovingId(heritageId);

    // Get the approved summary (possibly edited by user)
    const entry = submissions.find((s) => s.id === heritageId);
    const approvedSummary =
      editingSummary[heritageId]?.trim() || entry?.ai_summary || "";

    try {
      const res = await fetch(`${API_URL}/api/heritage/${heritageId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved_summary: approvedSummary }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data: HeritageEntry = await res.json();

      // Update the entry in our local state
      setSubmissions((prev) =>
        prev.map((e) => (e.id === heritageId ? data : e))
      );
      // Clean up editing state
      setEditingId(null);
      setEditingSummary((prev) => {
        const copy = { ...prev };
        delete copy[heritageId];
        return copy;
      });

      if (data.generated_images.length > 0 && !data.generated_images[0].error) {
        showToast("success", "AI image generated successfully!");
      } else {
        showToast("error", "Image generation encountered an issue. The entry has been saved.");
      }
    } catch (err) {
      showToast("error", `Approval failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* ── Background glow decorations ─────────────────────────── */}
      <div className="hero-glow" style={{ top: "-200px", left: "-100px", background: "radial-gradient(circle, rgba(34, 197, 94, 0.15), transparent)" }} />
      <div className="hero-glow" style={{ top: "200px", right: "-200px", background: "radial-gradient(circle, rgba(14, 165, 233, 0.1), transparent)" }} />
      <div className="hero-glow" style={{ bottom: "-100px", left: "30%", background: "radial-gradient(circle, rgba(34, 197, 94, 0.08), transparent)" }} />

      {/* ── Header / Hero ───────────────────────────────────────── */}
      <header style={{ padding: "24px 32px", position: "relative", zIndex: 1, borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1
              className="animate-fade-in-up"
              style={{
                opacity: 0,
                animationDelay: "0.1s",
                fontFamily: "var(--font-serif), monospace",
                fontSize: "24px",
                fontWeight: 700,
                background: "var(--gradient-heritage)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.1em"
              }}
            >
              MyBudayaHub // SYSTEM
            </h1>
            <p
              className="animate-fade-in-up"
              style={{
                opacity: 0,
                animationDelay: "0.2s",
                fontSize: "14px",
                color: "var(--text-secondary)",
                margin: 0,
                fontFamily: "var(--font-serif), monospace"
              }}
            >
              Awaiting heritage intelligence transmission...
            </p>
          </div>
          <div className="animate-fade-in-up" style={{ opacity: 0 }}>
            <span className="badge badge-gold" style={{ fontSize: "11px", fontFamily: "var(--font-serif), monospace" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", display: "inline-block", marginRight: "4px" }}/> ONLINE
            </span>
          </div>
        </div>
      </header>

      {/* ── Mission Control Layout ─────────────────────────────────────── */}
      <main style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "calc(100vh - 90px)", position: "relative", zIndex: 1 }}>
        {/* Left Column: Input Form */}
        <div style={{ padding: "32px", overflowY: "auto", borderRight: "1px solid var(--border)" }}>
        <form onSubmit={handleSubmit}>
          <div
            className="glass-card animate-fade-in-up"
            style={{ opacity: 0, animationDelay: "0.35s", padding: "36px", marginBottom: "32px" }}
          >
            <h2
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "24px",
                fontWeight: 600,
                marginBottom: "28px",
                color: "var(--text-primary)",
              }}
            >
              Document a Heritage
            </h2>

            {/* Title input */}
            <div style={{ marginBottom: "24px" }}>
              <label htmlFor="heritage-title" className="input-label">
                Heritage Title
              </label>
              <input
                id="heritage-title"
                type="text"
                className="input-field"
                placeholder="e.g., Batik Tulis, Wayang Kulit, Sape' Music..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description input */}
            <div style={{ marginBottom: "24px" }}>
              <label htmlFor="heritage-description" className="input-label">
                Description
              </label>
              <textarea
                id="heritage-description"
                className="input-field"
                placeholder="Describe this intangible cultural heritage in detail. Include its history, significance, how it is practiced, and why it matters to the community..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>

            {/* Media uploads - three separate optional zones */}
            <div style={{ marginBottom: "28px" }}>
              <label className="input-label">Media Attachments <span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: "12px" }}>(all optional)</span></label>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* ── Image Upload ── */}
                <div>
                  <div
                    className={`drop-zone ${dragOverZone === "image" ? "drag-over" : ""}`}
                    onDragOver={(e) => handleDragOver(e, "image")}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, setImageFiles, "image/")}
                    onClick={() => imageInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    id="image-drop-zone"
                    style={{ padding: "18px 20px", minHeight: "auto" }}
                  >
                    <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ color: "rgba(34, 197, 94, 0.6)", flexShrink: 0 }}>
                        <IconImage />
                      </div>
                      <div>
                        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "2px", fontWeight: 500 }}>
                          Images <span style={{ fontWeight: 400, fontSize: "12px", color: "var(--text-muted)" }}>— optional</span>
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                          Drop or click to add .jpg, .png, .webp files
                        </p>
                      </div>
                    </div>
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleMediaFileChange(e, setImageFiles)}
                    style={{ display: "none" }}
                    id="image-input"
                  />
                  {imageFiles.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                      {imageFiles.map((file, i) => (
                        <div key={`img-${file.name}-${i}`} className="file-chip">
                          <IconFile />
                          <span>{file.name}</span>
                          <span style={{ color: "var(--text-muted)" }}>({formatFileSize(file.size)})</span>
                          <button type="button" className="remove-btn" onClick={(e) => { e.stopPropagation(); removeMediaFile(i, setImageFiles); }} aria-label={`Remove ${file.name}`}><IconX /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Audio Upload ── */}
                <div>
                  <div
                    className={`drop-zone ${dragOverZone === "audio" ? "drag-over" : ""}`}
                    onDragOver={(e) => handleDragOver(e, "audio")}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, setAudioFiles, "audio/")}
                    onClick={() => audioInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    id="audio-drop-zone"
                    style={{ padding: "18px 20px", minHeight: "auto" }}
                  >
                    <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ color: "rgba(168, 85, 247, 0.6)", flexShrink: 0 }}>
                        <IconAudio />
                      </div>
                      <div>
                        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "2px", fontWeight: 500 }}>
                          Audio <span style={{ fontWeight: 400, fontSize: "12px", color: "var(--text-muted)" }}>— optional</span>
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                          Drop or click to add .mp3, .wav, .ogg files
                        </p>
                      </div>
                    </div>
                  </div>
                  <input
                    ref={audioInputRef}
                    type="file"
                    multiple
                    accept="audio/*"
                    onChange={(e) => handleMediaFileChange(e, setAudioFiles)}
                    style={{ display: "none" }}
                    id="audio-input"
                  />
                  {audioFiles.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                      {audioFiles.map((file, i) => (
                        <div key={`aud-${file.name}-${i}`} className="file-chip">
                          <IconFile />
                          <span>{file.name}</span>
                          <span style={{ color: "var(--text-muted)" }}>({formatFileSize(file.size)})</span>
                          <button type="button" className="remove-btn" onClick={(e) => { e.stopPropagation(); removeMediaFile(i, setAudioFiles); }} aria-label={`Remove ${file.name}`}><IconX /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Video Upload ── */}
                <div>
                  <div
                    className={`drop-zone ${dragOverZone === "video" ? "drag-over" : ""}`}
                    onDragOver={(e) => handleDragOver(e, "video")}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, setVideoFiles, "video/")}
                    onClick={() => videoInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    id="video-drop-zone"
                    style={{ padding: "18px 20px", minHeight: "auto" }}
                  >
                    <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ color: "rgba(14, 165, 233, 0.6)", flexShrink: 0 }}>
                        <IconVideo />
                      </div>
                      <div>
                        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "2px", fontWeight: 500 }}>
                          Video <span style={{ fontWeight: 400, fontSize: "12px", color: "var(--text-muted)" }}>— optional</span>
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                          Drop or click to add .mp4, .webm, .mov files
                        </p>
                      </div>
                    </div>
                  </div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={(e) => handleMediaFileChange(e, setVideoFiles)}
                    style={{ display: "none" }}
                    id="video-input"
                  />
                  {videoFiles.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                      {videoFiles.map((file, i) => (
                        <div key={`vid-${file.name}-${i}`} className="file-chip">
                          <IconFile />
                          <span>{file.name}</span>
                          <span style={{ color: "var(--text-muted)" }}>({formatFileSize(file.size)})</span>
                          <button type="button" className="remove-btn" onClick={(e) => { e.stopPropagation(); removeMediaFile(i, setVideoFiles); }} aria-label={`Remove ${file.name}`}><IconX /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* ── Document Upload ── */}
                  <div>
                    <div
                      className={`drop-zone ${dragOverZone === "document" ? "drag-over" : ""}`}
                      onDragOver={(e) => handleDragOver(e, "document")}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, setDocumentFiles, ["application/", "text/"])}
                      onClick={() => documentInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      id="document-drop-zone"
                      style={{ padding: "18px 20px", minHeight: "auto" }}
                    >
                      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ color: "rgba(245, 158, 11, 0.6)", flexShrink: 0 }}>
                          <IconFile />
                        </div>
                        <div>
                          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "2px", fontWeight: 500 }}>
                            Documents <span style={{ fontWeight: 400, fontSize: "12px", color: "var(--text-muted)" }}>— optional</span>
                          </p>
                          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                            Drop or click to add .docs, .txt, .xlsx files
                          </p>
                        </div>
                      </div>
                    </div>
                    <input
                      ref={documentInputRef}
                      type="file"
                      multiple
                      accept=".doc,.docx,.txt,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={(e) => handleMediaFileChange(e, setDocumentFiles)}
                      style={{ display: "none" }}
                      id="document-input"
                    />
                    {documentFiles.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                        {documentFiles.map((file, i) => (
                          <div key={`doc-${file.name}-${i}`} className="file-chip">
                            <IconFile />
                            <span>{file.name}</span>
                            <span style={{ color: "var(--text-muted)" }}>({formatFileSize(file.size)})</span>
                            <button type="button" className="remove-btn" onClick={(e) => { e.stopPropagation(); removeMediaFile(i, setDocumentFiles); }} aria-label={`Remove ${file.name}`}><IconX /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              id="submit-heritage"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }} />
                  Analysing Images...
                </>
              ) : (
                <>
                  <IconEye />
                  Submit &amp; Analyse
                </>
              )}
            </button>
          </div>
        </form>
      </div>

        {/* Right Column: Output / Dashboard */}
        <div style={{ padding: "32px", overflowY: "auto", position: "relative", background: "rgba(248, 250, 252, 0.4)" }}>
        {submissions.length > 0 && (
          <div ref={resultsSectionRef}>
            <h2
              style={{
                fontFamily: "var(--font-serif), monospace",
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "24px",
                color: "var(--text-primary)",
                borderBottom: "1px solid var(--border)",
                paddingBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}
            >
              <IconEye /> System Logs / Documented Heritage
            </h2>

            <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {submissions.map((entry) => (
                <div
                  key={entry.id}
                  className="heritage-card animate-fade-in-up"
                  style={{ opacity: 0 }}
                >
                  {/* Generated image (only shown after approval) */}
                  {entry.generated_images.length > 0 && entry.generated_images[0].base64 && (
                    <div style={{ position: "relative" }}>
                      <img
                        className="heritage-card-image"
                        src={`data:image/png;base64,${entry.generated_images[0].base64}`}
                        alt={`AI-generated image of ${entry.title}`}
                      />
                      <button
                        type="button"
                        id={`download-image-${entry.id}`}
                        title="Download image"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = `data:image/png;base64,${entry.generated_images[0].base64}`;
                          link.download = `${entry.title.replace(/[^a-zA-Z0-9]/g, "_")}_AI_Generated.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          showToast("success", "Image download started!");
                        }}
                        style={{
                          position: "absolute",
                          bottom: "16px",
                          right: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 18px",
                          background: "rgba(248, 250, 252, 0.75)",
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                          border: "1px solid rgba(22, 163, 74, 0.3)",
                          borderRadius: "12px",
                          color: "rgba(22, 163, 74, 0.9)",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 600,
                          fontFamily: "var(--font-serif), monospace",
                          letterSpacing: "0.04em",
                          transition: "all 0.25s ease",
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(22, 163, 74, 0.1)";
                          e.currentTarget.style.borderColor = "rgba(22, 163, 74, 0.6)";
                          e.currentTarget.style.color = "rgba(22, 163, 74, 1)";
                          e.currentTarget.style.boxShadow = "0 4px 24px rgba(22, 163, 74, 0.2)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(248, 250, 252, 0.75)";
                          e.currentTarget.style.borderColor = "rgba(22, 163, 74, 0.3)";
                          e.currentTarget.style.color = "rgba(22, 163, 74, 0.9)";
                          e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.1)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <IconDownload />
                        Download
                      </button>
                    </div>
                  )}

                  {/* Placeholder when no generated image yet */}
                  {entry.generated_images.length === 0 && (
                    <div
                      className="heritage-card-image"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: "12px",
                        color: "var(--text-muted)",
                      }}
                    >
                      <IconSparkles />
                      <span style={{ fontSize: "13px" }}>
                        {entry.status === "pending_approval"
                          ? "Approve summary to generate image"
                          : entry.status === "generating"
                          ? "Generating image…"
                          : "No image generated"}
                      </span>
                    </div>
                  )}

                  {/* Card content */}
                  <div style={{ padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: "16px", marginBottom: "12px" }}>
                      <h3
                        style={{
                          fontFamily: "var(--font-playfair), serif",
                          fontSize: "22px",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {entry.title}
                      </h3>
                      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                        {entry.status === "pending_approval" && (
                          <span className="badge badge-amber">
                            <IconEye /> Pending Approval
                          </span>
                        )}
                        {entry.status === "generating" && (
                          <span className="badge badge-purple">
                            <IconSparkles /> Generating...
                          </span>
                        )}
                        {entry.status === "complete" && entry.generated_images.length > 0 && !entry.generated_images[0].error && (
                          <span className="badge badge-gold">
                            <IconSparkles /> AI Generated
                          </span>
                        )}
                        {entry.uploaded_files.length > 0 && (
                          <span className="badge badge-teal">
                            {entry.uploaded_files.length} file{entry.uploaded_files.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <p
                      style={{
                        fontSize: "15px",
                        color: "var(--text-secondary)",
                        lineHeight: 1.7,
                        marginBottom: "16px",
                        display: expandedCard === entry.id ? "block" : "-webkit-box",
                        WebkitLineClamp: expandedCard === entry.id ? undefined : 3,
                        WebkitBoxOrient: "vertical",
                        overflow: expandedCard === entry.id ? "visible" : "hidden",
                      }}
                    >
                      {entry.description}
                    </p>

                    {entry.description.length > 200 && (
                      <button
                        onClick={() =>
                          setExpandedCard(expandedCard === entry.id ? null : entry.id)
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--accent-gold)",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          marginBottom: "16px",
                          padding: 0,
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        {expandedCard === entry.id ? "Show less" : "Read more"}
                        <span
                          style={{
                            transform: expandedCard === entry.id ? "rotate(180deg)" : "rotate(0)",
                            transition: "transform 0.3s",
                            display: "flex",
                          }}
                        >
                          <IconChevronDown />
                        </span>
                      </button>
                    )}

                    {/* ── AI Analysis Description (Step 1 result) ── */}
                    {entry.image_analysis.length > 0 && (
                      <div className="analysis-panel" style={{ marginBottom: "20px" }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "12px",
                        }}>
                          <IconEye />
                          <p style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "var(--accent-gold-light)",
                            margin: 0,
                          }}>
                            AI Image Analysis
                          </p>
                        </div>

                        {entry.image_analysis.map((analysis, idx) => (
                          <div key={idx} style={{ marginBottom: idx < entry.image_analysis.length - 1 ? "12px" : "0" }}>
                            {analysis.source_file && (
                              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", fontStyle: "italic" }}>
                                {analysis.source_file}
                              </p>
                            )}
                            {analysis.description ? (
                              <p style={{
                                fontSize: "14px",
                                color: "var(--text-primary)",
                                lineHeight: 1.7,
                                margin: 0,
                                padding: "10px 14px",
                                background: "rgba(34, 197, 94, 0.06)",
                                borderRadius: "10px",
                                border: "1px solid rgba(34, 197, 94, 0.12)",
                              }}>
                                &ldquo;{analysis.description}&rdquo;
                              </p>
                            ) : analysis.error ? (
                              <p style={{
                                fontSize: "13px",
                                color: "#dc5050",
                                margin: 0,
                                padding: "10px 14px",
                                background: "rgba(220, 80, 80, 0.06)",
                                borderRadius: "10px",
                                border: "1px solid rgba(220, 80, 80, 0.12)",
                              }}>
                                Analysis failed: {analysis.error}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── AI Summary (Gemini-generated, for user approval) ── */}
                    {entry.ai_summary && entry.status === "pending_approval" && (
                      <div
                        className="analysis-panel"
                        style={{
                          marginBottom: "20px",
                          background: "rgba(14, 165, 233, 0.04)",
                          border: "1px solid rgba(14, 165, 233, 0.15)",
                          borderRadius: "14px",
                          padding: "20px",
                        }}
                      >
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                          marginBottom: "14px",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <IconBrain />
                            <p style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              color: "rgba(56, 189, 248, 0.9)",
                              margin: 0,
                            }}>
                              AI Summary — Review &amp; Approve
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (editingId === entry.id) {
                                setEditingId(null);
                              } else {
                                setEditingId(entry.id);
                                setEditingSummary((prev) => ({
                                  ...prev,
                                  [entry.id]: prev[entry.id] ?? entry.ai_summary,
                                }));
                              }
                            }}
                            style={{
                              background: editingId === entry.id ? "rgba(56, 189, 248, 0.15)" : "transparent",
                              border: "1px solid rgba(56, 189, 248, 0.2)",
                              borderRadius: "8px",
                              color: "rgba(56, 189, 248, 0.9)",
                              cursor: "pointer",
                              padding: "6px 12px",
                              fontSize: "12px",
                              fontWeight: 500,
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              transition: "all 0.2s",
                              fontFamily: "var(--font-serif), monospace",
                            }}
                            id={`edit-summary-${entry.id}`}
                          >
                            <IconEdit />
                            {editingId === entry.id ? "Done Editing" : "Edit"}
                          </button>
                        </div>

                        <p style={{
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          marginBottom: "10px",
                          fontStyle: "italic",
                          lineHeight: 1.5,
                        }}>
                          This summary will be used as the prompt for image generation. You can edit it before approving.
                        </p>

                        {editingId === entry.id ? (
                          <textarea
                            className="input-field"
                            value={editingSummary[entry.id] ?? entry.ai_summary}
                            onChange={(e) =>
                              setEditingSummary((prev) => ({
                                ...prev,
                                [entry.id]: e.target.value,
                              }))
                            }
                            rows={4}
                            style={{
                              background: "rgba(14, 165, 233, 0.06)",
                              border: "1px solid rgba(14, 165, 233, 0.2)",
                              fontSize: "14px",
                              lineHeight: 1.7,
                              color: "var(--text-primary)",
                              resize: "vertical",
                            }}
                            id={`summary-textarea-${entry.id}`}
                          />
                        ) : (
                          <p style={{
                            fontSize: "14px",
                            color: "var(--text-primary)",
                            lineHeight: 1.8,
                            margin: 0,
                            padding: "14px 16px",
                            background: "rgba(14, 165, 233, 0.06)",
                            borderRadius: "10px",
                            border: "1px solid rgba(14, 165, 233, 0.12)",
                          }}>
                            {editingSummary[entry.id] ?? entry.ai_summary}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Show approved summary for completed entries */}
                    {entry.ai_summary && entry.status === "complete" && (
                      <div
                        style={{
                          marginBottom: "20px",
                          padding: "14px 16px",
                          background: "rgba(34, 197, 94, 0.04)",
                          borderRadius: "10px",
                          border: "1px solid rgba(34, 197, 94, 0.12)",
                        }}
                      >
                        <p style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "rgba(34, 197, 94, 0.7)",
                          marginBottom: "8px",
                        }}>
                          ✓ Approved Prompt
                        </p>
                        <p style={{
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                          lineHeight: 1.7,
                          margin: 0,
                          fontStyle: "italic",
                        }}>
                          &ldquo;{entry.ai_summary}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* ── Approval buttons (Step 2 trigger) ── */}
                    {entry.status === "pending_approval" && (
                      <div style={{
                        display: "flex",
                        gap: "12px",
                        marginBottom: "20px",
                        padding: "16px",
                        background: "rgba(34, 197, 94, 0.04)",
                        borderRadius: "12px",
                        border: "1px solid rgba(34, 197, 94, 0.1)",
                      }}>
                        <button
                          className="btn-primary"
                          onClick={() => handleApprove(entry.id)}
                          disabled={approvingId === entry.id}
                          id={`approve-${entry.id}`}
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            padding: "12px 20px",
                          }}
                        >
                          {approvingId === entry.id ? (
                            <>
                              <div className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }} />
                              Generating Image...
                            </>
                          ) : (
                            <>
                              <IconCheck />
                              Approve Summary &amp; Generate Image
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Generation error after approval */}
                    {entry.status === "complete" && entry.generated_images.length > 0 && entry.generated_images[0].error && !entry.generated_images[0].base64 && (
                      <div
                        style={{
                          padding: "12px 16px",
                          background: "rgba(220, 80, 80, 0.06)",
                          borderRadius: "10px",
                          border: "1px solid rgba(220, 80, 80, 0.12)",
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#dc5050",
                          fontSize: "13px",
                        }}
                      >
                        <IconImage />
                        Image generation failed: {entry.generated_images[0].error}
                      </div>
                    )}

                    {/* Uploaded files list */}
                    {entry.uploaded_files.length > 0 && (
                      <div style={{ marginBottom: "16px" }}>
                        <p style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "8px" }}>
                          Attached Files
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {entry.uploaded_files.map((uf) => (
                            <a
                              key={uf.saved_name}
                              href={`${API_URL}${uf.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="file-chip"
                              style={{ textDecoration: "none" }}
                            >
                              <IconFile />
                              <span>{uf.original_name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                        color: "var(--text-muted)",
                      }}
                    >
                      <IconClock />
                      {formatDate(entry.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer
        style={{
          textAlign: "center",
          padding: "32px 24px",
          borderTop: "1px solid var(--border)",
          fontSize: "13px",
          color: "var(--text-muted)",
        }}
      >
        <p>MyBudayaHub — Preserving living heritage through technology</p>
        <p style={{ marginTop: "4px", fontSize: "12px" }}>
          Powered by Google Gemini &amp; Imagen AI
        </p>
      </footer>

      {/* ── Toast notification ──────────────────────────────────── */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}


