// Simplified, hand-drawn-style outline of Ohio with a pin dropped on Powell —
// where NextStep's co-founders are from. Not surveying-grade, just charming.
const OhioMap = () => {
  return (
    <div className="relative w-full aspect-[6/5] rounded-xl border border-border bg-gradient-to-br from-primary/[0.07] via-transparent to-transparent overflow-hidden">
      <svg
        viewBox="0 0 190 215"
        className="absolute inset-0 w-full h-full p-5"
        aria-hidden="true"
      >
        <path
          d="M20 15
             L55 8 L95 4 L130 10 L160 22 L178 40
             L183 75 L178 110 L168 140 L150 158
             L130 172 L108 182 L85 190 L60 195 L35 205
             L15 185 L8 140 L6 90 L12 45 Z"
          className="fill-primary/[0.08] stroke-primary/45"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* pulse + pin marking Powell, OH */}
        <circle cx="90" cy="92" r="10" className="fill-primary/20 animate-ping" style={{ transformOrigin: "90px 92px" }} />
        <circle cx="90" cy="92" r="5.5" className="fill-primary stroke-card" strokeWidth="2.5" />
      </svg>

      <div
        className="absolute flex items-center gap-1 rounded-full bg-card border border-primary/25 shadow-sm pl-1.5 pr-2.5 py-1"
        style={{ left: "47.4%", top: "42.8%", transform: "translate(8px, -50%)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-foreground whitespace-nowrap">
          Powell, OH
        </span>
      </div>
    </div>
  );
};

export default OhioMap;
