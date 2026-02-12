import { Link } from "@tanstack/react-router";

export function ListNotFound() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">List not found</h1>
        <Link
          to="/lists"
          className="text-zinc-400 hover:text-white transition-colors"
        >
          ← Back to lists
        </Link>
      </div>
    </div>
  );
}
