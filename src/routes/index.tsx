import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useCRPC } from "@/lib/convex/crpc";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const crpc = useCRPC();
  const { data: wordLists = [], error } = useQuery(
    crpc.wordLists.getUserLists.queryOptions({})
  );

  // Handle unauthorized error silently - user will see empty state
  if (error?.message?.includes("UNAUTHORIZED")) {
    // Return empty state for unauthenticated users
  }

  const totalWords = wordLists.reduce(
    (acc: number, list) => acc + (list.wordCount ?? 0),
    0
  );
  const masteredWords = wordLists.reduce(
    (acc: number, list) => acc + (list.wordCount ?? 0),
    0
  );
  const totalPracticeTime = wordLists.reduce(
    (acc: number, list) => acc + list.totalPracticeTime,
    0
  );
  const practiceHours = Math.floor(totalPracticeTime / (1000 * 60 * 60));
  const practiceMinutes = Math.floor(
    (totalPracticeTime % (1000 * 60 * 60)) / (1000 * 60)
  );

  const hasActivity = wordLists.length > 0;

  return (
    <div className="paper-texture min-h-screen bg-[#0a0a0b] text-[#f5f5f0]">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24 lg:px-12">
        {/* Hero Section */}
        <section className="mb-24 sm:mb-32">
          <div className="max-w-3xl">
            <div className="mb-8 animate-fade-in-up">
              <div className="mb-8 h-px w-12 animate-line-expand bg-[#2d6b6b]" />
            </div>

            <h1 className="mb-8 animate-fade-in-up font-display font-medium text-5xl leading-[0.95] tracking-tight delay-100 sm:text-6xl lg:text-7xl">
              Spelling
              <br />
              <span className="text-[#8a8a82]">as craft</span>
            </h1>

            <p className="mb-12 max-w-xl animate-fade-in-up font-body text-[#8a8a82] text-lg leading-relaxed delay-200 sm:text-xl">
              Build precision through deliberate practice. Curate your
              vocabulary with intention and care.
            </p>

            <div className="animate-fade-in-up delay-300">
              <Link
                className="group inline-flex items-center gap-3 border border-[#2a2a2c] px-6 py-4 font-mono text-[#f5f5f0] text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:border-[#2d6b6b] hover:bg-[#2d6b6b]"
                to="/lists"
              >
                Begin
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {hasActivity && (
          <section className="mb-24 animate-fade-in delay-400 sm:mb-32">
            <div className="border-[#2a2a2c] border-t border-b py-8">
              <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[#6a6a62] text-xs tracking-[0.1em]">
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
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
            <FeatureItem
              delay={500}
              description="Curate your vocabulary with intention. Organize words by subject, difficulty, or personal relevance."
              number="01"
              title="Custom Lists"
            />
            <FeatureItem
              delay={600}
              description="Practice at optimal intervals. Time-tested scheduling ensures lasting retention."
              number="02"
              title="Spaced Review"
            />
            <FeatureItem
              delay={700}
              description="Hear correct pronunciation. Built-in speech synthesis for auditory learners."
              number="03"
              title="Audio Guidance"
            />
          </div>
        </section>

        {/* Continue Practicing Section */}
        {wordLists.length > 0 && (
          <section className="animate-fade-in delay-700">
            <div className="mb-8">
              <div className="mb-2 font-mono text-[#6a6a62] text-xs uppercase tracking-[0.15em]">
                Continue
              </div>
              <div className="h-px w-full bg-[#2a2a2c]" />
            </div>

            <div className="space-y-0">
              {wordLists.slice(0, 3).map((list, index) => (
                <Link
                  className="group flex items-center justify-between border-[#2a2a2c] border-b py-4 transition-colors duration-300 hover:border-[#3a3a3c]"
                  key={list.id}
                  params={{ listId: list.id }}
                  style={{
                    animationDelay: `${800 + index * 100}ms`,
                  }}
                  to="/practice/$listId"
                >
                  <div className="flex items-center gap-6">
                    <span className="w-6 font-mono text-text-muted text-xs">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-body text-[#f5f5f0] text-base transition-colors group-hover:text-[#f5f5f0]">
                        {list.name}
                      </h3>
                      <p className="font-mono text-text-muted text-xs">
                        {list.wordCount} words · {list.wordCount ?? 0} mastered
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#2d6b6b]" />
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
      <div className="mb-4 flex items-baseline gap-4">
        <span className="font-mono text-[#2d6b6b] text-xs tracking-[0.15em]">
          {number}
        </span>
        <div className="h-px flex-1 bg-[#2a2a2c] transition-colors duration-300 group-hover:bg-[#3a3a3c]" />
      </div>
      <h3 className="mb-3 font-display font-medium text-[#f5f5f0] text-xl sm:text-2xl">
        {title}
      </h3>
      <p className="font-body text-[#8a8a82] leading-relaxed">{description}</p>
    </div>
  );
}
