import { useState } from "react";
import { X, Building, GraduationCap, Tag, Layers, Database, ExternalLink, Play, BookmarkCheck, Bookmark, Copy, Check, Share2 } from "lucide-react";
import { CatBadge } from "../common/CatBadge";
import { Problem } from "../../types";
import { getYoutubeId } from "../../utils";

export function DetailDrawer({ problem, onClose, bookmarks, onBookmark }: {
  problem: Problem | null; onClose: () => void;
  bookmarks: Set<number>; onBookmark: (id: number) => void;
}) {
  const [copied, setCopied] = useState(false);
  const isOpen = !!problem;
  const copyId = () => {
    if (!problem) return;
    navigator.clipboard.writeText(String(problem.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-150 z-50 transform transition-transform duration-300 ease-out
        bg-(--card) border-l border-(--border) shadow-2xl overflow-y-auto
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        {problem && (
          <div className="flex flex-col h-full">
            <div className="sticky top-0 bg-(--card) border-b border-(--border) p-5 flex items-start justify-between gap-4 z-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-mono font-medium text-(--primary) bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                    #{problem.id}
                  </span>
                  <CatBadge cat={problem.category} />
                </div>
                <h2 className="text-lg font-semibold text-(--foreground) leading-snug">{problem.title}</h2>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-(--muted) transition-colors shrink-0">
                <X size={18} className="text-(--muted-foreground)" />
              </button>
            </div>
            <div className="p-5 space-y-5 flex-1">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Organization", value: problem.organization, icon: <Building size={14} /> },
                  { label: "Department", value: problem.department, icon: <GraduationCap size={14} /> },
                  { label: "Theme", value: problem.theme, icon: <Tag size={14} /> },
                  { label: "Category", value: problem.category, icon: <Layers size={14} /> },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="bg-(--muted) rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-(--muted-foreground) mb-1">
                      {icon}
                      <span className="text-xs font-medium">{label}</span>
                    </div>
                    <p className="text-sm font-medium text-(--foreground) leading-tight">{value || "—"}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-(--foreground) mb-2">Description</h3>
                <p className="text-sm text-(--muted-foreground) leading-relaxed whitespace-pre-wrap">{problem.description}</p>
              </div>
              {problem.datasetLinks && (
                <div>
                  <h3 className="text-sm font-semibold text-(--foreground) mb-2">Dataset Links</h3>
                  <div className="space-y-2">
                    {problem.datasetLinks.split(":").filter(l => l.startsWith("http")).map((link, i) => (
                      <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-(--primary) hover:underline">
                        <Database size={14} />{link.length > 60 ? link.slice(0, 60) + "…" : link}
                        <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {problem.youtubeLinks && (() => {
                const ytId = getYoutubeId(problem.youtubeLinks);
                return (
                  <div>
                    <h3 className="text-sm font-semibold text-(--foreground) mb-2">YouTube Video</h3>
                    {ytId ? (
                      <div className="rounded-xl overflow-hidden aspect-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}`}
                          className="w-full h-full" allowFullScreen
                          title="Problem Statement Video"
                        />
                      </div>
                    ) : (
                      <a href={problem.youtubeLinks} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-red-500 hover:underline">
                        <Play size={14} />Watch Video<ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="sticky bottom-0 bg-(--card) border-t border-(--border) p-4 flex gap-2">
              <button onClick={() => onBookmark(problem.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border
                  ${bookmarks.has(problem.id)
                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                    : "border-(--border) text-(--muted-foreground) hover:bg-(--muted)"}`}>
                {bookmarks.has(problem.id) ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                {bookmarks.has(problem.id) ? "Saved" : "Save"}
              </button>
              <button onClick={copyId}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-all">
                {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                {copied ? "Copied!" : "Copy ID"}
              </button>
              <button onClick={() => { navigator.share?.({ title: problem.title, url: window.location.href }); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-all ml-auto">
                <Share2 size={15} />Share
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
