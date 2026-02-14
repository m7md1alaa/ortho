import { Link } from "@tanstack/react-router";

export function ListNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-zinc-100">
      <div className="text-center">
        <h1 className="mb-4 font-bold text-2xl">List not found</h1>
        <Link
          className="text-zinc-400 transition-colors hover:text-white"
          to="/lists"
        >
          ← Back to lists
        </Link>
      </div>
    </div>
  );
}
