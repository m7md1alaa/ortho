import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import {
	ArrowRight,
	BookOpen,
	Brain,
	Sparkles,
	Target,
	Trophy,
} from "lucide-react";
import { store } from "@/store";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const wordLists = useStore(store, (state) => state.wordLists);
	const totalWords = wordLists.reduce(
		(acc, list) => acc + list.words.length,
		0,
	);
	const masteredWords = wordLists.reduce(
		(acc, list) => acc + list.words.filter((w) => w.streak >= 5).length,
		0,
	);
	const totalPracticeTime = wordLists.reduce(
		(acc, list) => acc + list.totalPracticeTime,
		0,
	);
	const practiceHours = Math.floor(totalPracticeTime / (1000 * 60 * 60));
	const practiceMinutes = Math.floor(
		(totalPracticeTime % (1000 * 60 * 60)) / (1000 * 60),
	);

	return (
		<div className="min-h-screen bg-black text-zinc-100">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="text-center mb-16">
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full mb-6">
						<Sparkles className="w-4 h-4 text-zinc-400" />
						<span className="text-sm text-zinc-400">
							Master spelling with spaced repetition
						</span>
					</div>
					<h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
						Master Your
						<br />
						<span className="text-zinc-500">Spelling</span>
					</h1>
					<p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8">
						Create custom word lists, practice with audio pronunciation, and
						track your progress with intelligent spaced repetition.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Link
							to="/lists"
							className="px-8 py-4 bg-zinc-100 text-black font-medium rounded-lg hover:bg-white transition-colors flex items-center gap-2"
						>
							Get Started
							<ArrowRight className="w-4 h-4" />
						</Link>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
					<StatCard
						icon={<BookOpen className="w-6 h-6" />}
						value={wordLists.length}
						label="Word Lists"
					/>
					<StatCard
						icon={<Brain className="w-6 h-6" />}
						value={totalWords}
						label="Total Words"
					/>
					<StatCard
						icon={<Trophy className="w-6 h-6" />}
						value={masteredWords}
						label="Mastered"
					/>
					<StatCard
						icon={<Target className="w-6 h-6" />}
						value={
							practiceHours > 0
								? `${practiceHours}h ${practiceMinutes}m`
								: `${practiceMinutes}m`
						}
						label="Practice Time"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<FeatureCard
						icon={<BookOpen className="w-8 h-8" />}
						title="Custom Word Lists"
						description="Create personalized lists for any subject. Add definitions, examples, and difficulty levels."
					/>
					<FeatureCard
						icon={<Brain className="w-8 h-8" />}
						title="Spaced Repetition"
						description="Intelligent scheduling ensures you review words at optimal intervals for maximum retention."
					/>
					<FeatureCard
						icon={<Target className="w-8 h-8" />}
						title="Audio Pronunciation"
						description="Built-in text-to-speech helps you learn correct pronunciation while you practice."
					/>
				</div>

				{wordLists.length > 0 && (
					<div className="mt-16">
						<h2 className="text-2xl font-bold mb-6">Continue Practicing</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{wordLists.slice(0, 3).map((list) => (
								<Link
									key={list.id}
									to="/practice/$listId"
									params={{ listId: list.id }}
									className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all"
								>
									<h3 className="font-semibold text-lg mb-2 group-hover:text-white transition-colors">
										{list.name}
									</h3>
									<p className="text-zinc-500 text-sm mb-4">
										{list.words.length} words ·{" "}
										{list.words.filter((w) => w.streak >= 5).length} mastered
									</p>
									<div className="flex items-center text-zinc-400 text-sm group-hover:text-zinc-300 transition-colors">
										Start Practice
										<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
									</div>
								</Link>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function StatCard({
	icon,
	value,
	label,
}: {
	icon: React.ReactNode;
	value: number | string;
	label: string;
}) {
	return (
		<div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
			<div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-800 rounded-lg text-zinc-400 mb-4">
				{icon}
			</div>
			<div className="text-3xl font-bold mb-1">{value}</div>
			<div className="text-zinc-500 text-sm">{label}</div>
		</div>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6">
			<div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-800/50 rounded-lg text-zinc-400 mb-4">
				{icon}
			</div>
			<h3 className="font-semibold text-lg mb-2">{title}</h3>
			<p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
		</div>
	);
}
