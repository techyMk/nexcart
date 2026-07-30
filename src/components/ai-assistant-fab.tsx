"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  Loader2,
  Pencil,
  RefreshCw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";

type Role = "user" | "assistant";
type Message = {
  id: string;
  role: Role;
  content: string;
  sources?: string[];
};

const SUGGESTIONS = [
  "What does NexCart sell?",
  "What's your return policy?",
  "How do I track my order?",
  "Tell me about NexCart Intelligence.",
];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AIAssistantFab() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!user) {
      setProfileAvatar(null);
      setProfileName(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();
        if (cancelled) return;
        setProfileAvatar(
          data?.avatar_url ??
            (user.user_metadata?.avatar_url as string | undefined) ??
            null,
        );
        setProfileName(
          data?.full_name ??
            (user.user_metadata?.full_name as string | undefined) ??
            user.email ??
            null,
        );
      } catch {
        if (!cancelled) {
          setProfileAvatar(
            (user.user_metadata?.avatar_url as string | undefined) ?? null,
          );
          setProfileName(
            (user.user_metadata?.full_name as string | undefined) ??
              user.email ??
              null,
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const userInitials = useMemo(() => {
    const source = profileName ?? user?.email ?? "";
    return (
      source
        .split(/[\s@._-]+/)
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "·"
    );
  }, [profileName, user?.email]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  // Cancel any in-flight request when the panel closes
  useEffect(() => {
    if (!open && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setStreaming(false);
    }
  }, [open]);

  if (pathname?.startsWith("/admin")) return null;

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    setErr(null);
    const userMsg: Message = { id: uid(), role: "user", content: trimmed };
    const assistantId = uid();
    const next: Message[] = [
      ...messages,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ];
    setMessages(next);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next
            .filter((m) => m.role === "user" || m.content.length > 0)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        let serverMsg = `Chat failed (${res.status})`;
        try {
          serverMsg = JSON.parse(text).error ?? serverMsg;
        } catch {
          /* ignore */
        }
        throw new Error(serverMsg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      let sources: string[] | undefined;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const evt of events) {
          const line = evt.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.type === "delta") {
              acc += parsed.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: acc } : m,
                ),
              );
            } else if (parsed.type === "sources") {
              sources = parsed.titles;
            } else if (parsed.type === "error") {
              throw new Error(parsed.message ?? "Stream error");
            }
          } catch {
            /* tolerate partial frames */
          }
        }
      }

      if (sources?.length) {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, sources } : m)),
        );
      }
      if (!acc) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    "I couldn't put together a reply just now. Mind trying again?",
                }
              : m,
          ),
        );
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setErr(e instanceof Error ? e.message : "Chat failed");
      // Strip the empty assistant placeholder on failure
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void send(input);
  }

  function reset() {
    if (streaming) {
      abortRef.current?.abort();
      setStreaming(false);
    }
    setMessages([]);
    setErr(null);
    setInput("");
  }

  function onEdit(id: string) {
    if (streaming) return;
    const idx = messages.findIndex((m) => m.id === id);
    if (idx === -1) return;
    const target = messages[idx];
    if (target.role !== "user") return;
    setMessages(messages.slice(0, idx));
    setInput(target.content);
    setErr(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 280 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-4 z-[60] inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-brand text-white shadow-glow ring-1 ring-white/20 md:bottom-6 md:right-6"
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
      >
        <span className="absolute inset-0 -z-10 animate-pulse-slow rounded-full bg-gradient-brand opacity-50 blur-xl" />
        {open ? (
          <X size={20} />
        ) : (
          <Image
            src="/brand/bot-icon.webp"
            alt=""
            width={72}
            height={72}
            className="h-9 w-9 object-contain drop-shadow"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="fixed bottom-[8.5rem] right-3 z-[60] flex h-[70vh] w-[94vw] max-w-sm flex-col overflow-hidden rounded-3xl border border-border bg-surface/95 shadow-card backdrop-blur-2xl sm:right-6 md:bottom-24"
          >
            <div className="relative border-b border-border p-5">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/40 to-transparent" />
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-gradient-brand shadow-glow">
                  <Image
                    src="/brand/bot-icon.webp"
                    alt=""
                    width={56}
                    height={56}
                    className="h-7 w-7 object-contain drop-shadow"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-display text-base font-semibold">
                    NexCart Intelligence
                  </div>
                  <div className="text-xs text-text-2">
                    {streaming ? "Thinking…" : "Ask me anything about NexCart."}
                  </div>
                </div>
                {messages.length > 0 && (
                  <button
                    onClick={reset}
                    aria-label="Start new chat"
                    className="grid h-8 w-8 place-items-center rounded-full text-text-2 hover:bg-card-2 hover:text-text"
                  >
                    <RefreshCw size={14} />
                  </button>
                )}
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
              {messages.length === 0 ? (
                <div className="space-y-2">
                  <div className="rounded-2xl border border-border bg-card p-3 text-sm text-text">
                    Hi! I&apos;m NexCart Intelligence. Ask me anything about
                    our products, policies, shipping, returns, or company.
                  </div>
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => void send(s)}
                      className="block w-full rounded-xl border border-border bg-card px-4 py-2.5 text-left text-sm text-text-2 transition hover:border-text/20 hover:bg-card-2 hover:text-text"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <ul className="space-y-3">
                  {messages.map((m) => (
                    <li
                      key={m.id}
                      className={`group ${
                        m.role === "user"
                          ? "ml-auto max-w-[85%]"
                          : "max-w-[90%]"
                      }`}
                    >
                      <div
                        className={
                          m.role === "user"
                            ? "flex items-end justify-end gap-2"
                            : ""
                        }
                      >
                        <div
                          className={
                            m.role === "user"
                              ? "rounded-2xl rounded-br-md bg-gradient-brand px-3 py-2 text-sm text-white"
                              : "rounded-2xl rounded-bl-md bg-card px-3 py-2 text-sm text-text"
                          }
                        >
                          {m.content ? (
                            m.role === "assistant" ? (
                              <ChatMarkdown content={m.content} />
                            ) : (
                              <span className="whitespace-pre-wrap">{m.content}</span>
                            )
                          ) : (
                            <span className="inline-flex gap-1 align-middle">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-400" />
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-400 [animation-delay:0.15s]" />
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-400 [animation-delay:0.3s]" />
                            </span>
                          )}
                        </div>
                        {m.role === "user" && (
                          <UserAvatar
                            src={profileAvatar}
                            initials={userInitials}
                            name={profileName ?? "You"}
                          />
                        )}
                      </div>
                      {m.content && (
                        <div
                          className={`mt-1 flex gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 ${
                            m.role === "user" ? "justify-end" : ""
                          }`}
                        >
                          {m.role === "user" && (
                            <IconAction
                              label="Edit message"
                              onClick={() => onEdit(m.id)}
                              disabled={streaming}
                            >
                              <Pencil size={12} />
                            </IconAction>
                          )}
                          <CopyAction text={m.content} />
                        </div>
                      )}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px] text-text-2">
                          <Sparkles size={10} className="text-primary-300" />
                          <span className="uppercase tracking-widest">Source:</span>
                          {m.sources.map((s) => (
                            <span
                              key={s}
                              className="rounded-full bg-card px-1.5 py-0.5 ring-1 ring-border"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {err && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>{err}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border p-3">
              <form
                onSubmit={onSubmit}
                className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about NexCart…"
                  disabled={streaming}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-2 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={streaming || !input.trim()}
                  className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-white disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send"
                >
                  {streaming ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Renders assistant replies as markdown — bold, lists, links, code, tables.
 * Tight chat-bubble styling; everything inherits the bubble's text color.
 */
function ChatMarkdown({ content }: { content: string }) {
  return (
    <div className="text-sm leading-relaxed [&>:first-child]:mt-0 [&>:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-1.5">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-text">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => (
            <code className="rounded bg-card-2 px-1 py-0.5 font-mono text-[12px] text-primary-700 ring-1 ring-border dark:text-primary-200">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="my-2 overflow-x-auto rounded-lg bg-card p-2 font-mono text-[12px] ring-1 ring-border">
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul className="my-1.5 ml-4 list-disc space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-1.5 ml-4 list-decimal space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-300 underline underline-offset-2 hover:text-primary-200"
            >
              {children}
            </a>
          ),
          h1: ({ children }) => (
            <div className="mt-2 mb-1 text-base font-semibold text-text">
              {children}
            </div>
          ),
          h2: ({ children }) => (
            <div className="mt-2 mb-1 text-sm font-semibold text-text">
              {children}
            </div>
          ),
          h3: ({ children }) => (
            <div className="mt-2 mb-1 text-sm font-semibold text-text">
              {children}
            </div>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-1.5 border-l-2 border-border pl-2 text-text-2">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-2 border-border" />,
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto">
              <table className="w-full border-collapse text-[12px]">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-card px-2 py-1 text-left font-medium text-text">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-2 py-1">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function IconAction({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-6 w-6 place-items-center rounded-full text-text-2 transition hover:bg-card-2 hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function UserAvatar({
  src,
  initials,
  name,
}: {
  src: string | null;
  initials: string;
  name: string;
}) {
  return (
    <span
      title={name}
      aria-label={name}
      className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-brand text-[10px] font-semibold text-white ring-1 ring-border"
    >
      {src ? (
        <Image
          src={src}
          alt=""
          width={56}
          height={56}
          unoptimized
          referrerPolicy="no-referrer"
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </span>
  );
}

function CopyAction({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore — older browsers without clipboard API */
    }
  }

  return (
    <IconAction label={copied ? "Copied" : "Copy message"} onClick={onCopy}>
      {copied ? (
        <Check size={12} className="text-emerald-300" />
      ) : (
        <Copy size={12} />
      )}
    </IconAction>
  );
}
