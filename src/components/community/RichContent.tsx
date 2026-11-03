import React from "react";

const IMAGE_RE = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i;
const VIDEO_RE = /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i;
const URL_RE = /(https?:\/\/[^\s<>"']+)/g;

const embedUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
};

const Link: React.FC<{ url: string }> = ({ url }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="text-primary underline underline-offset-2 break-all"
    onClick={(e) => e.stopPropagation()}
  >
    {url}
  </a>
);

const Block: React.FC<{ url: string }> = ({ url }) => {
  if (IMAGE_RE.test(url)) {
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        className="max-h-[28rem] w-auto max-w-full rounded-2xl border border-border/50"
      />
    );
  }
  if (VIDEO_RE.test(url)) {
    return <video src={url} controls className="max-h-[28rem] w-full rounded-2xl bg-black" />;
  }
  const embed = embedUrl(url);
  if (embed) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <iframe
          src={embed}
          title="Video"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return <Link url={url} />;
};

export const RichContent: React.FC<{ text: string }> = ({ text }) => (
  <div className="space-y-3 text-foreground">
    {text.split("\n").map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      if (/^https?:\/\/\S+$/.test(trimmed)) return <Block key={i} url={trimmed} />;
      return (
        <p key={i} className="whitespace-pre-wrap">
          {line.split(URL_RE).map((part, j) =>
            /^https?:\/\//.test(part) ? <Link key={j} url={part} /> : part
          )}
        </p>
      );
    })}
  </div>
);
