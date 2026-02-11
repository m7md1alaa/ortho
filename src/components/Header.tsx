import { Link } from "@tanstack/react-router";
import { BookOpen, List } from "lucide-react";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<Link to="/" className="flex items-center gap-2">
						<div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
							<BookOpen className="w-5 h-5 text-black" />
						</div>
						<span className="font-bold text-xl tracking-tight">Ortho</span>
					</Link>

					<nav className="flex items-center gap-1">
						<Link
							to="/"
							className="px-4 py-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-900"
							activeProps={{ className: "text-white bg-zinc-900" }}
						>
							Home
						</Link>
						<Link
							to="/lists"
							className="px-4 py-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-900 flex items-center gap-2"
							activeProps={{ className: "text-white bg-zinc-900" }}
						>
							<List className="w-4 h-4" />
							Lists
						</Link>
					</nav>
				</div>
			</div>
		</header>
	);
}
