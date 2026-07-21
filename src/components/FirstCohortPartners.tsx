import Reveal from "@/components/Reveal";

// Placeholder partners — swap `logo` in for an imported image per partner when available.
const partners = [
  { name: "Partner One" },
  { name: "Partner Two" },
  { name: "Partner Three" },
  { name: "Partner Four" },
  { name: "Partner Five" },
  { name: "Partner Six" },
];

const LogoTile = ({ name }: { name: string }) => (
  <div className="flex-shrink-0 w-40 h-16 mx-3 border border-border rounded-md bg-card flex items-center justify-center">
    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground/60">
      {name}
    </span>
  </div>
);

const FirstCohortPartners = () => {
  return (
    <section className="py-12 sm:py-16 border-b border-border bg-background">
      <div className="container px-4 sm:px-6">
        <Reveal className="text-center mb-8 sm:mb-10">
          <p className="eyebrow mb-3">First cohort</p>
          <h2 className="text-2xl sm:text-3xl font-medium font-heading text-foreground tracking-tight">
            Our first cohort of partners
          </h2>
        </Reveal>
      </div>

      {/* Auto-scrolling logo marquee; track is duplicated for a seamless loop */}
      <Reveal delay={0.1}>
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-background to-transparent" />
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex" aria-hidden={copy === 1}>
                {partners.map((partner) => (
                  <LogoTile key={`${copy}-${partner.name}`} name={partner.name} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default FirstCohortPartners;
