import Reveal from "@/components/Reveal";

const partners = [
  { name: "MadLab", logo: "/logos/images%20(1).jpeg", url: "http://madlab.net/index.html" },
  { name: "Glass Rooster Cannery", logo: "/logos/images%20(1).png", url: "https://www.glassroostercannery.com/" },
  { name: "Belle's Bread", logo: "/logos/images%20(2).png", url: "https://bellesbread.japanmarketplace.com/" },
  { name: "Columbus Dry Cleaning & Laundry Services", logo: "/logos/images.jpeg", url: "https://www.columbuscleaning.com/" },
];

const LogoTile = ({ name, logo, url }: { name: string; logo: string; url: string }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex-shrink-0 w-40 h-16 mx-3 border border-border rounded-md bg-white flex items-center justify-center overflow-hidden p-2 transition-opacity hover:opacity-75"
  >
    <img
      src={logo}
      alt={name}
      className="max-h-full max-w-full object-contain"
    />
  </a>
);

const FirstCohortPartners = () => {
  return (
    <section className="py-12 sm:py-16 border-b border-border bg-background">
      <div className="container px-4 sm:px-6">
        <Reveal className="text-center mb-8 sm:mb-10">
          <p className="eyebrow mb-3">First cohort</p>
          <h2 className="text-2xl sm:text-3xl font-medium font-heading text-foreground tracking-tight">
            Our founding cohort of partners
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
                  <LogoTile key={`${copy}-${partner.name}`} name={partner.name} logo={partner.logo} url={partner.url} />
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
