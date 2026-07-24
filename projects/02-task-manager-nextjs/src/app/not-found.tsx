import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 text-center">
      <div className="space-y-4">
        <FileQuestion className="w-16 h-16 text-indigo-500 mx-auto" />
        <h2 className="text-2xl font-extrabold">404 - Page Not Found</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          The task or resource you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Board
        </Link>
      </div>
    </div>
  );
}
