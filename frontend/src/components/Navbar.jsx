import { Worm } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="navbar border-b border-base-200 justify-center py-4 bg-base-100">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold flex items-center gap-2">
          {/* Custom color hex injected inline for your custom wine theme accent */}
          <Worm color="#722F37" size={32} />
          <span>Strands</span>
        </h1>
      </div>
    </nav>
  );
}
