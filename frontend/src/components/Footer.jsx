import wormTwisted from "../assets/worm-twisted-mono.svg";

export default function Footer() {
  return (
    <footer className="relative sm:footer-horizontal overflow-hidden bg-base-300 text-base-content">
      {/* Giant background text */}
      <div className="absolute inset-x-0 bottom-[-20px] flex justify-center pointer-events-none select-none">
        <span className="text-[8rem] md:text-[12rem] font-black leading-none opacity-10 whitespace-nowrap">
          STRANDS
        </span>
      </div>

      <aside className="relative z-10 flex min-h-48 flex-col items-center justify-start gap-2 pt-4">
        <img
          src={wormTwisted}
          alt="Worm Twisted Graphic"
          className="w-12 h-12"
        />{" "}
      </aside>
    </footer>
  );
}
