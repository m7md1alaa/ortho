import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { ArrowRight } from "lucide-react";
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

  const hasActivity = wordLists.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f0] paper-texture">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-24">
        {/* Hero Section */}
        <section className="mb-24 sm:mb-32">
          <div className="max-w-3xl">
            <div className="mb-8 animate-fade-in-up">
              <div className="w-12 h-px bg-[#2d6b6b] mb-8 animate-line-expand" />
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-medium leading-[0.95] tracking-tight mb-8 animate-fade-in-up delay-100">
              Spelling
              <br />
              <span className="text-[#8a8a82]">as craft</span>
            </h1>

            <p className="font-body text-lg sm:text-xl text-[#8a8a82] leading-relaxed max-w-xl mb-12 animate-fade-in-up delay-200">
              Build precision through deliberate practice. Curate your
              vocabulary with intention and care.
            </p>

            <div className="animate-fade-in-up delay-300">
              <Link
                to="/lists"
                className="inline-flex items-center gap-3 font-mono text-xs tracking-[0.2em] uppercase text-[#f5f5f0] border border-[#2a2a2c] px-6 py-4 hover:bg-[#2d6b6b] hover:border-[#2d6b6b] transition-all duration-300 group"
              >
                Begin
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {hasActivity && (
          <section className="mb-24 sm:mb-32 animate-fade-in delay-400">
            <div className="py-8 border-t border-b border-[#2a2a2c]">
              <div className="font-mono text-xs tracking-[0.1em] text-[#6a6a62] flex flex-wrap gap-x-6 gap-y-2">
                <span>{wordLists.length} lists</span>
                <span className="text-[#2a2a2c]">·</span>
                <span>{totalWords} words</span>
                <span className="text-[#2a2a2c]">·</span>
                <span className="text-[#2d6b6b]">{masteredWords} mastered</span>
                <span className="text-[#2a2a2c]">·</span>
                <span>
                  {practiceHours > 0
                    ? `${practiceHours}h ${practiceMinutes}m`
                    : `${practiceMinutes}m`}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="mb-24 sm:mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            <FeatureItem
              number="01"
              title="Custom Lists"
              description="Curate your vocabulary with intention. Organize words by subject, difficulty, or personal relevance."
              delay={500}
            />
            <FeatureItem
              number="02"
              title="Spaced Review"
              description="Practice at optimal intervals. Time-tested scheduling ensures lasting retention."
              delay={600}
            />
            <FeatureItem
              number="03"
              title="Audio Guidance"
              description="Hear correct pronunciation. Built-in speech synthesis for auditory learners."
              delay={700}
            />
          </div>
        </section>

        {/* Continue Practicing Section */}
        {wordLists.length > 0 && (
          <section className="animate-fade-in delay-700">
            <div className="mb-8">
              <div className="font-mono text-xs tracking-[0.15em] uppercase text-[#6a6a62] mb-2">
                Continue
              </div>
              <div className="w-full h-px bg-[#2a2a2c]" />
            </div>

            <div className="space-y-0">
              {wordLists.slice(0, 3).map((list, index) => (
                <Link
                  key={list.id}
                  to="/practice/$listId"
                  params={{ listId: list.id }}
                  className="group flex items-center justify-between py-4 border-b border-[#2a2a2c] hover:border-[#3a3a3c] transition-colors duration-300"
                  style={{ animationDelay: `${800 + index * 100}ms` }}
                >
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-xs text-[#6a6a62] w-6">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-body text-base text-[#f5f5f0] group-hover:text-[#f5f5f0] transition-colors">
                        {list.name}
                      </h3>
                      <p className="font-mono text-xs text-[#6a6a62]">
                        {list.words.length} words ·{" "}
                        {list.words.filter((w) => w.streak >= 5).length}{" "}
                        mastered
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#6a6a62] group-hover:text-[#2d6b6b] group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function FeatureItem({
  number,
  title,
  description,
  delay,
}: {
  number: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <div
      className="group animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-baseline gap-4 mb-4">
        <span className="font-mono text-xs tracking-[0.15em] text-[#2d6b6b]">
          {number}
        </span>
        <div className="flex-1 h-px bg-[#2a2a2c] group-hover:bg-[#3a3a3c] transition-colors duration-300" />
      </div>
      <h3 className="font-display text-xl sm:text-2xl font-medium mb-3 text-[#f5f5f0]">
        {title}
      </h3>
      <p className="font-body text-[#8a8a82] leading-relaxed">{description}</p>
    </div>
  );
}
