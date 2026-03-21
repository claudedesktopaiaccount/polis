import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} Progressive Tracker
          </p>
          <nav className="flex items-center gap-6">
            <Link
              href="/sukromie"
              className="text-sm text-neutral-500 hover:text-violet-600 transition-colors"
            >
              Ochrana súkromia
            </Link>
            <Link
              href="/podmienky"
              className="text-sm text-neutral-500 hover:text-violet-600 transition-colors"
            >
              Podmienky používania
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
