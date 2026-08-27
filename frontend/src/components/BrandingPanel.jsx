import CandyWorm from "../assets/candy-worm.svg";
// Placeholder imports for your other two worms (adjust names if necessary)
import WormStraight from "../assets/worm-straight-mono.svg";
import WormTwisted from "../assets/worm-twisted-mono.svg";

export default function BrandingPanel() {
  return (
    <div className="card bg-base-200 rounded-box relative min-h-[500px] lg:min-h-[450px] grow overflow-hidden p-8 flex flex-col justify-center items-center select-none border border-base-300/40">
      {/* Background Ambient Glow Layer */}
      <div className="absolute inset-0 bg-radial-[at_center,_var(--color-primary)_0%,_transparent_70%] opacity-15 pointer-events-none" />

      {/* ================= BACKGROUND CLIPPED SVGS ================= */}

      {/* Worm 1 Layer (Bottom Right Corner - Main Interactive Graphic) */}
      <div className="absolute -bottom-16 -right-16 w-80 h-80 pointer-events-auto z-0">
        <img
          src={CandyWorm}
          alt="Aesthetic Shadow Vector 1"
          className="absolute inset-0 w-full h-full object-contain opacity-10 blur-[2px] translate-x-4 -translate-y-4 scale-105 pointer-events-none"
        />
        <img
          src={CandyWorm}
          alt="Aesthetic Vector 1"
          className="w-full h-full object-contain text-primary drop-shadow-[0_10px_20px_rgba(var(--color-primary),0.2)] hover-wiggle cursor-pointer rotate-12 hover:rotate-6 duration-300"
        />
      </div>

      {/* Worm 2 Layer (Top Left Corner - High Abstract Crop) */}
      <div className="absolute -top-20 -left-16 w-64 h-64 opacity-40 pointer-events-auto z-0">
        <img
          src={WormStraight}
          alt="Aesthetic Vector 2"
          className="w-full h-full object-contain hover-wiggle cursor-pointer -rotate-45 hover:-rotate-35 duration-300 filter drop-shadow-[0_10px_15px_rgba(var(--color-primary),0.1)]"
        />
      </div>

      {/* Worm 3 Layer (Mid Right Edge Crop - Floating Effect) */}
      <div className="absolute top-1/3 -right-20 w-56 h-56 opacity-25 pointer-events-auto z-0">
        <img
          src={WormTwisted}
          alt="Aesthetic Vector 3"
          className="w-full h-full object-contain hover-wiggle cursor-pointer rotate-90 hover:rotate-85 duration-300"
        />
      </div>

      {/* ================= CENTERED TEXT CONTENT ================= */}
      <div className="relative z-10 max-w-sm text-center flex flex-col items-center">
        <h2 className="text-6xl font-black tracking-tight text-base-content drop-shadow-sm">
          strands<span className="text-primary">.</span>
        </h2>
        <p className="text-base text-secondary mt-4 leading-relaxed font-medium">
          Connect the dots. Share the strand.{" "}
        </p>
      </div>

      {/* Bottom metadata tag layout */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-xs text-secondary/30 font-mono tracking-widest uppercase">
        The minimalist micro network.{" "}
      </div>
    </div>
  );
}
