interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

interface NewsHeadlinesProps {
  items: NewsItem[];
  compact?: boolean;
}

export default function NewsHeadlines({ items, compact = false }: NewsHeadlinesProps) {
  if (items.length === 0) return null;

  const visibleItems = compact ? items.slice(0, 4) : items;

  return (
    <div className="divide-y divide-divider">
      {visibleItems.map((item, i) => (
        <a
          key={i}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`block hover:bg-hover transition-colors ${compact ? "py-2" : "py-4"}`}
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className={`font-medium uppercase tracking-wider text-text/40 shrink-0 ${compact ? "text-[9px]" : "text-[10px]"}`}>
              {item.source}
            </span>
            <span className={`text-text/30 tabular-nums shrink-0 ${compact ? "text-[9px]" : "text-[10px]"}`}>
              {item.publishedAt}
            </span>
          </div>
          <h3 className={`mt-1 font-medium text-ink leading-snug line-clamp-2 group-hover:underline ${compact ? "text-xs" : "text-sm"}`}>
            {item.title}
          </h3>
        </a>
      ))}
    </div>
  );
}
