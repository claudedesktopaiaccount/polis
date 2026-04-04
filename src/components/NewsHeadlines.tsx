interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

interface NewsHeadlinesProps {
  items: NewsItem[];
}

export default function NewsHeadlines({ items }: NewsHeadlinesProps) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-sm text-text/40 italic">
        Žiadne správy k dispozícii.
      </p>
    );
  }

  return (
    <div className="divide-y divide-divider">
      {items.map((item, i) => (
        <a
          key={i}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block py-4 hover:bg-hover transition-colors"
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[10px] font-medium uppercase tracking-wider text-text/40 shrink-0">
              {item.source}
            </span>
            <span className="text-[10px] text-text/30 tabular-nums shrink-0">
              {item.publishedAt}
            </span>
          </div>
          <h3 className="mt-1 text-sm font-medium text-ink leading-snug line-clamp-2 group-hover:underline">
            {item.title}
          </h3>
        </a>
      ))}
    </div>
  );
}
