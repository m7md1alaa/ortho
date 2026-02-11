import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0b]/90 backdrop-blur-sm border-b border-[#2a2a2c]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 border border-[#2d6b6b] flex items-center justify-center transition-all duration-300 group-hover:bg-[#2d6b6b]/10">
              <span className="font-display text-lg text-[#f5f5f0] leading-none">
                O
              </span>
            </div>
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-[#8a8a82] hidden sm:block">
              Ortho
            </span>
          </Link>

          <nav className="flex items-center gap-8">
            <Link
              to="/"
              className="font-mono text-xs tracking-[0.15em] uppercase text-[#8a8a82] hover:text-[#f5f5f0] transition-colors duration-300 hover-underline"
              activeProps={{ className: "text-[#f5f5f0]" }}
            >
              Home
            </Link>
            <Link
              to="/lists"
              className="font-mono text-xs tracking-[0.15em] uppercase text-[#8a8a82] hover:text-[#f5f5f0] transition-colors duration-300 hover-underline"
              activeProps={{ className: "text-[#f5f5f0]" }}
            >
              Lists
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
