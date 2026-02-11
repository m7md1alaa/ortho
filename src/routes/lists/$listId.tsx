import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import {
	AlertCircle,
	ArrowLeft,
	Brain,
	CheckCircle,
	Edit2,
	Plus,
	Save,
	Trash2,
	Volume2,
	X,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import {
	addWord,
	deleteWord,
	generateId,
	store,
	updateWord,
	updateWordList,
} from "@/store";
import type { Word } from "@/types";

export const Route = createFileRoute("/lists/$listId")({
	component: ListDetailPage,
});

const wordSchema = z.object({
	word: z.string().min(1, "Word is required"),
	definition: z.string().optional(),
	example: z.string().optional(),
	difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

function ListDetailPage() {
	const { listId } = useParams({ from: "/lists/$listId" });
	const wordLists = useStore(store, (state) => state.wordLists);
	const list = wordLists.find((l) => l.id === listId);
	const [editingWord, setEditingWord] = useState<Word | null>(null);
	const [isAdding, setIsAdding] = useState(false);

	if (!list) {
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

	return (
		<div className="min-h-screen bg-black text-zinc-100">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="mb-8">
					<Link
						to="/lists"
						className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to lists
					</Link>
					<h1 className="text-4xl font-bold tracking-tight mb-2">
						{list.name}
					</h1>
					{list.description && (
						<p className="text-zinc-400 text-lg">{list.description}</p>
					)}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-1 space-y-6">
						<div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
							<h2 className="text-lg font-semibold mb-4">List Stats</h2>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-zinc-400">Total Words</span>
									<span className="text-2xl font-bold">
										{list.words.length}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-zinc-400">Mastered</span>
									<span className="text-2xl font-bold text-green-400">
										{list.words.filter((w) => w.streak >= 5).length}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-zinc-400">Accuracy</span>
									<span className="text-2xl font-bold">
										{list.words.length > 0
											? Math.round(
													(list.words.reduce(
														(acc, w) => acc + w.correctCount,
														0,
													) /
														Math.max(
															list.words.reduce(
																(acc, w) =>
																	acc + w.correctCount + w.incorrectCount,
																0,
															),
															1,
														)) *
														100,
												)
											: 0}
										%
									</span>
								</div>
							</div>
						</div>

						<Link
							to="/practice/$listId"
							params={{ listId: list.id }}
							className="block w-full px-4 py-3 bg-zinc-100 text-black text-center rounded-lg hover:bg-white transition-colors font-medium"
						>
							Start Practice Session
						</Link>

						{(isAdding || editingWord) && (
							<div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
								<h3 className="text-lg font-semibold mb-4">
									{editingWord ? "Edit Word" : "Add New Word"}
								</h3>
								<WordForm
									word={editingWord}
									onSubmit={(data) => {
										if (editingWord) {
											updateWord(listId, editingWord.id, data);
											setEditingWord(null);
										} else {
											addWord(listId, data);
											setIsAdding(false);
										}
									}}
									onCancel={() => {
										setIsAdding(false);
										setEditingWord(null);
									}}
								/>
							</div>
						)}

						{!isAdding && !editingWord && (
							<button
								onClick={() => setIsAdding(true)}
								className="w-full px-4 py-3 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors font-medium flex items-center justify-center gap-2"
							>
								<Plus className="w-5 h-5" />
								Add Word
							</button>
						)}
					</div>

					<div className="lg:col-span-2">
						{list.words.length === 0 ? (
							<div className="text-center py-16 bg-zinc-900/30 border border-zinc-800 rounded-xl">
								<Brain className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
								<h3 className="text-xl font-medium text-zinc-300 mb-2">
									No words yet
								</h3>
								<p className="text-zinc-500">
									Add your first word to start practicing
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{list.words.map((word, index) => (
									<WordCard
										key={word.id}
										word={word}
										index={index + 1}
										onEdit={() => setEditingWord(word)}
										onDelete={() => deleteWord(listId, word.id)}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function WordForm({
	word,
	onSubmit,
	onCancel,
}: {
	word: Word | null;
	onSubmit: (data: {
		word: string;
		definition?: string;
		example?: string;
		difficulty: "easy" | "medium" | "hard";
	}) => void;
	onCancel: () => void;
}) {
	const form = useForm({
		defaultValues: {
			word: word?.word || "",
			definition: word?.definition || "",
			example: word?.example || "",
			difficulty: word?.difficulty || "medium",
		},
		validators: {
			onSubmit: wordSchema,
		},
		onSubmit: async ({ value }) => {
			onSubmit(
				value as {
					word: string;
					definition?: string;
					example?: string;
					difficulty: "easy" | "medium" | "hard";
				},
			);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.Field
				name="word"
				children={(field) => (
					<div>
						<label className="block text-sm font-medium text-zinc-400 mb-1">
							Word *
						</label>
						<input
							type="text"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Enter the word"
							className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
							autoFocus
						/>
						{field.state.meta.errors.length > 0 && (
							<p className="mt-1 text-sm text-red-400">
								{field.state.meta.errors[0]}
							</p>
						)}
					</div>
				)}
			/>

			<form.Field
				name="definition"
				children={(field) => (
					<div>
						<label className="block text-sm font-medium text-zinc-400 mb-1">
							Definition
						</label>
						<textarea
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="What does this word mean?"
							rows={2}
							className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all resize-none"
						/>
					</div>
				)}
			/>

			<form.Field
				name="example"
				children={(field) => (
					<div>
						<label className="block text-sm font-medium text-zinc-400 mb-1">
							Example Sentence
						</label>
						<textarea
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Use the word in a sentence..."
							rows={2}
							className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all resize-none"
						/>
					</div>
				)}
			/>

			<form.Field
				name="difficulty"
				children={(field) => (
					<div>
						<label className="block text-sm font-medium text-zinc-400 mb-1">
							Difficulty
						</label>
						<select
							value={field.state.value}
							onChange={(e) =>
								field.handleChange(e.target.value as "easy" | "medium" | "hard")
							}
							className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
						>
							<option value="easy">Easy</option>
							<option value="medium">Medium</option>
							<option value="hard">Hard</option>
						</select>
					</div>
				)}
			/>

			<div className="flex gap-3 pt-2">
				<button
					type="submit"
					disabled={form.state.isSubmitting}
					className="flex-1 px-4 py-2 bg-zinc-100 text-black font-medium rounded-lg hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
				>
					<Save className="w-4 h-4" />
					{word ? "Update" : "Add"} Word
				</button>
				<button
					type="button"
					onClick={onCancel}
					className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-colors"
				>
					<X className="w-4 h-4" />
				</button>
			</div>
		</form>
	);
}

function WordCard({
	word,
	index,
	onEdit,
	onDelete,
}: {
	word: Word;
	index: number;
	onEdit: () => void;
	onDelete: () => void;
}) {
	const speakWord = () => {
		if ("speechSynthesis" in window) {
			const utterance = new SpeechSynthesisUtterance(word.word);
			utterance.rate = 0.8;
			window.speechSynthesis.speak(utterance);
		}
	};

	const totalAttempts = word.correctCount + word.incorrectCount;
	const accuracy =
		totalAttempts > 0
			? Math.round((word.correctCount / totalAttempts) * 100)
			: 0;

	return (
		<div className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="flex items-center gap-3 mb-2">
						<span className="text-zinc-600 text-sm font-mono">#{index}</span>
						<h3 className="text-xl font-semibold text-zinc-100">{word.word}</h3>
						<button
							onClick={speakWord}
							className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors"
							title="Listen"
						>
							<Volume2 className="w-4 h-4" />
						</button>
					</div>

					{word.definition && (
						<p className="text-zinc-400 mb-2">{word.definition}</p>
					)}

					{word.example && (
						<p className="text-zinc-500 italic text-sm mb-3">
							"{word.example}"
						</p>
					)}

					<div className="flex items-center gap-4 text-sm">
						<span
							className={`px-2 py-1 rounded text-xs font-medium ${
								word.difficulty === "easy"
									? "bg-green-900/30 text-green-400"
									: word.difficulty === "medium"
										? "bg-yellow-900/30 text-yellow-400"
										: "bg-red-900/30 text-red-400"
							}`}
						>
							{word.difficulty}
						</span>

						{word.streak > 0 && (
							<span className="flex items-center gap-1 text-green-400">
								<CheckCircle className="w-4 h-4" />
								{word.streak} streak
							</span>
						)}

						{totalAttempts > 0 && (
							<span
								className={`flex items-center gap-1 ${
									accuracy >= 80
										? "text-green-400"
										: accuracy >= 50
											? "text-yellow-400"
											: "text-red-400"
								}`}
							>
								<AlertCircle className="w-4 h-4" />
								{accuracy}% accuracy
							</span>
						)}

						{word.nextReview && word.nextReview > new Date() && (
							<span className="text-zinc-600">
								Next review: {word.nextReview.toLocaleDateString()}
							</span>
						)}
					</div>
				</div>

				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						onClick={onEdit}
						className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors"
						title="Edit"
					>
						<Edit2 className="w-4 h-4" />
					</button>
					<button
						onClick={onDelete}
						className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
						title="Delete"
					>
						<Trash2 className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
