"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileText,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";

type Doc = {
  id: string;
  title: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  status: "pending" | "indexing" | "ready" | "failed";
  chunk_count: number;
  error: string | null;
  created_at: string;
};

const statusStyle: Record<Doc["status"], string> = {
  pending: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  indexing: "bg-primary-500/15 text-primary-200 ring-primary-500/30",
  ready: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  failed: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
};

function bytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function KnowledgeView({ documents }: { documents: Doc[] }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalChunks = documents.reduce((acc, d) => acc + d.chunk_count, 0);
  const ready = documents.filter((d) => d.status === "ready").length;

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    if (f && !title.trim()) {
      setTitle(f.name.replace(/\.[^.]+$/, ""));
    }
  }

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!file) {
      setErr("Pick a file first (PDF, TXT or MD, up to 20 MB).");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      if (title.trim()) form.append("title", title.trim());
      const r = await fetch("/api/admin/kb/upload", { method: "POST", body: form });
      const text = await r.text();
      const data = text ? JSON.parse(text) : {};
      if (!r.ok) {
        throw new Error(data.error ?? `Upload failed (${r.status})`);
      }
      setMsg(`Indexed ${data.chunks} chunk${data.chunks === 1 ? "" : "s"} from “${title || file.name}”.`);
      setFile(null);
      setTitle("");
      if (fileInput.current) fileInput.current.value = "";
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(id: string, title: string) {
    if (!confirm(`Delete “${title}” and its embeddings? This can't be undone.`)) return;
    setDeletingId(id);
    setErr(null);
    setMsg(null);
    try {
      const r = await fetch(`/api/admin/kb/${id}`, { method: "DELETE" });
      const text = await r.text();
      const data = text ? JSON.parse(text) : {};
      if (!r.ok) throw new Error(data.error ?? `Delete failed (${r.status})`);
      setMsg(`Deleted “${title}”.`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-eyebrow">Intelligence</div>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Knowledge base
          </h1>
          <p className="mt-1 text-sm text-text-2">
            Documents the AI assistant uses to answer questions about your
            company. {ready}/{documents.length} ready · {totalChunks} chunks indexed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs text-text-2 ring-1 ring-border">
            <Database size={12} /> pgvector · 1536 dims
          </span>
        </div>
      </div>

      {/* Upload card */}
      <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Upload size={15} /> Upload a document
        </div>
        <p className="mt-1 text-xs text-text-2">
          PDF, TXT or MD up to 20 MB. Indexing usually takes 5–30 seconds.
        </p>

        <form onSubmit={onUpload} className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block min-w-0">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-text-2">
                Title (optional)
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. NexCart company handbook"
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20"
              />
            </label>
            <label className="block min-w-0">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-text-2">
                File
              </span>
              <input
                ref={fileInput}
                type="file"
                accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
                onChange={onFileChange}
                className="block w-full cursor-pointer rounded-xl border border-border bg-card px-3 py-2 text-sm text-text-2 file:mr-3 file:rounded-full file:border-0 file:bg-card-2 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-text hover:file:bg-surface-2"
              />
            </label>
          </div>

          <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
            {file && (
              <span className="truncate text-xs text-text-2">
                Ready: <span className="text-text">{file.name}</span> · {bytes(file.size)}
              </span>
            )}
            <button
              type="submit"
              disabled={uploading || !file}
              className="btn btn-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              {uploading ? "Indexing…" : "Upload + index"}
            </button>
          </div>
        </form>

        {err && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span className="break-words">{err}</span>
          </div>
        )}
        {msg && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-200">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
            <span className="break-words">{msg}</span>
          </div>
        )}
      </div>

      {/* Documents list */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-xl">
        <div className="border-b border-border p-5">
          <div className="text-sm font-semibold">Indexed documents</div>
          <div className="text-xs text-text-2">
            The chat assistant searches across all <span className="text-text">ready</span> documents.
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="grid place-items-center px-6 py-16 text-center">
            <FileText size={22} className="text-text-2" />
            <div className="mt-3 font-medium">No documents yet</div>
            <p className="mt-1 max-w-sm text-sm text-text-2">
              Upload your company handbook, FAQ or product catalog above. The
              AI assistant will start using it the moment it&apos;s indexed.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {documents.map((d, i) => (
              <motion.li
                key={d.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className="flex items-center gap-4 p-4"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-card text-primary-300 ring-1 ring-border">
                  <FileText size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{d.title}</div>
                  <div className="truncate text-xs text-text-2">
                    {d.filename} · {bytes(d.size_bytes)} · {d.chunk_count} chunks · {timeAgo(d.created_at)}
                  </div>
                  {d.status === "failed" && d.error && (
                    <div className="mt-1 truncate text-xs text-rose-300">
                      {d.error}
                    </div>
                  )}
                </div>
                <span
                  className={`hidden rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ring-1 md:inline ${statusStyle[d.status]}`}
                >
                  {d.status === "indexing" && (
                    <Loader2 size={10} className="mr-1 inline animate-spin" />
                  )}
                  {d.status}
                </span>
                <button
                  onClick={() => onDelete(d.id, d.title)}
                  disabled={deletingId === d.id}
                  aria-label="Delete document"
                  className="grid h-8 w-8 place-items-center rounded-lg text-text-2 hover:bg-card-2 hover:text-rose-400 disabled:opacity-50"
                >
                  {deletingId === d.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
