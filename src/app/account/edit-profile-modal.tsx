"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Loader2,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateProfileAction } from "./actions";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

// SVG presets shipped in /public/avatars/.
const PRESETS = [
  "ava",
  "charlotte",
  "ethan",
  "isabella",
  "liam",
  "logan",
  "lucas",
  "mason",
  "mia",
  "noah",
  "olivia",
  "sophia",
] as const;

const presetPath = (name: (typeof PRESETS)[number]) => `/avatars/${name}.svg`;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function EditProfileModal({
  open,
  onClose,
  initialFullName,
  initialAvatarUrl,
}: {
  open: boolean;
  onClose: () => void;
  initialFullName: string;
  initialAvatarUrl: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [fullName, setFullName] = useState(initialFullName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setFullName(initialFullName);
      setAvatarUrl(initialAvatarUrl ?? "");
      setErr(null);
      setSaved(false);
    }
  }, [open, initialFullName, initialAvatarUrl]);

  // Lock body scroll
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending && !uploading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending, uploading, onClose]);

  async function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset input so the same file can be picked again later
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErr("Please pick an image (PNG, JPG, WebP, or GIF).");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setErr(
        `Image is over ${Math.round(MAX_AVATAR_BYTES / 1024 / 1024)} MB. Please pick a smaller file.`,
      );
      return;
    }

    setErr(null);
    setUploading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("You need to be signed in to upload an avatar.");
      }

      const ext =
        (file.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "") ||
        "png";
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
          cacheControl: "3600",
        });

      if (uploadErr) {
        if (/bucket .* not found|bucket not found/i.test(uploadErr.message)) {
          throw new Error(
            "Avatars bucket is missing — run supabase/migrations/008_avatars_bucket.sql in the Supabase SQL Editor.",
          );
        }
        throw new Error(uploadErr.message);
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      // Cache-bust on update so the new image shows immediately
      setAvatarUrl(`${urlData.publicUrl}?v=${Date.now()}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onRemoveAvatar() {
    setAvatarUrl("");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    startTransition(async () => {
      const result = await updateProfileAction({ fullName, avatarUrl });
      if (!result.ok) {
        setErr(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => onClose(), 700);
    });
  }

  const dirty =
    fullName.trim() !== initialFullName.trim() ||
    avatarUrl.trim() !== (initialAvatarUrl ?? "").trim();

  const busy = pending || uploading;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !busy && onClose()}
            aria-label="Close"
            className="absolute inset-0 cursor-default bg-bg/70 backdrop-blur-md"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-profile-title"
              className="pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-surface/95 shadow-card backdrop-blur-2xl"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-accent-purple/20 blur-3xl" />

              <div className="relative flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-500/15 text-primary-300 ring-1 ring-primary-500/30">
                    <Pencil size={13} />
                  </span>
                  <div
                    id="edit-profile-title"
                    className="font-display text-base font-semibold"
                  >
                    Edit profile
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !busy && onClose()}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-text-2 hover:bg-card-2 hover:text-text"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={onSubmit} className="relative space-y-5 p-6">
                {/* Avatar + upload controls */}
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    aria-label="Change avatar"
                    className="group relative inline-flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-brand text-lg font-semibold shadow-glow ring-2 ring-border transition hover:ring-text/30 disabled:cursor-wait"
                  >
                    {avatarUrl ? (
                      <Image
                        key={avatarUrl}
                        src={avatarUrl}
                        alt="Avatar preview"
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                        unoptimized
                      />
                    ) : (
                      <span className="text-white">
                        {initials(fullName) || "·"}
                      </span>
                    )}
                    {/* Hover hint — change/upload */}
                    <span className="absolute inset-0 grid place-items-center rounded-full bg-bg/60 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                      <Upload size={16} className="text-white" />
                    </span>
                    {/* Hard loading overlay */}
                    {uploading && (
                      <span className="absolute inset-0 grid place-items-center rounded-full bg-bg/70 backdrop-blur-sm">
                        <Loader2 size={18} className="animate-spin text-white" />
                      </span>
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT}
                    onChange={onFilePick}
                    className="hidden"
                  />

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs hover:bg-card-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {uploading ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Upload size={12} />
                        )}
                        {uploading
                          ? "Uploading…"
                          : avatarUrl
                            ? "Change photo"
                            : "Upload photo"}
                      </button>
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={onRemoveAvatar}
                          disabled={uploading}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-text-2 hover:bg-card-2 hover:text-rose-300 disabled:opacity-60"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>
                    <div className="mt-2 text-[11px] text-text-2">
                      PNG, JPG, WebP, GIF · up to 5 MB
                    </div>
                  </div>
                </div>

                {/* Preset avatars */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-text-2">
                    <span className="h-px flex-1 bg-border" />
                    Or pick a preset
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <div className="grid grid-cols-6 gap-2 sm:grid-cols-6">
                    {PRESETS.map((name) => {
                      const src = presetPath(name);
                      const selected = avatarUrl === src;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setAvatarUrl(src)}
                          disabled={uploading}
                          aria-label={`Use ${name} avatar`}
                          aria-pressed={selected}
                          title={name[0].toUpperCase() + name.slice(1)}
                          className={`relative aspect-square overflow-hidden rounded-full bg-card transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
                            selected
                              ? "ring-2 ring-primary-400 shadow-glow"
                              : "ring-1 ring-border hover:ring-text/30"
                          }`}
                        >
                          <Image
                            src={src}
                            alt={name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                          {selected && (
                            <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-primary-500 ring-2 ring-surface">
                              <Check size={9} className="text-white" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs uppercase tracking-widest text-text-2">
                    Full name
                  </span>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    maxLength={80}
                    placeholder="Alex Vance"
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20"
                  />
                </label>

                {err && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <span className="break-words">{err}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={busy}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm text-text-2 hover:text-text disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy || !dirty || saved}
                    className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pending ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving…
                      </>
                    ) : saved ? (
                      <>
                        <Check size={14} /> Saved
                      </>
                    ) : (
                      <>
                        <Check size={14} /> Save changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
