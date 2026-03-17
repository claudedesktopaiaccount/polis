interface NewsItem {
  title: string;
  url: string;
  source: "SME" | "TASR" | "Pravda";
  publishedAt: string;
}

const SOURCE_COLORS: Record<string, string> = {
  SME: "bg-blue-50 text-blue-700",
  TASR: "bg-neutral-100 text-neutral-600",
  Pravda: "bg-red-50 text-red-700",
};

interface NewsHeadlinesProps {
  items: NewsItem[];
}

export default function NewsHeadlines({ items }: NewsHeadlinesProps) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <a
          key={i}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white rounded-xl shadow-sm border border-neutral-100 p-4 hover:shadow-md transition-all duration-200"
        >
          <span
            className={`inline-block text-xs uppercase font-semibold rounded-full px-2.5 py-0.5 mb-2 ${
              SOURCE_COLORS[item.source] ?? "bg-neutral-100 text-neutral-600"
            }`}
          >
            {item.source}
          </span>
          <h3 className="text-base font-medium text-neutral-800 line-clamp-2 leading-snug">
            {item.title}
          </h3>
          <p className="mt-2 text-xs text-neutral-400">{item.publishedAt}</p>
        </a>
      ))}
    </div>
  );
}
