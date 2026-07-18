import { Linkedin, Globe, User } from "lucide-react";
import Reveal from "@/components/Reveal";

// Replace names, links, and photo placeholders with real ones.
const founders = [
  {
    name: "Agastya Mishra",
    role: "Co-founder",
    linkedin: "#",
    website: "#",
    photo: null, // import a headshot and set it here
  },
  {
    name: "Co-founder Name",
    role: "Co-founder",
    linkedin: "#",
    website: "#",
    photo: null,
  },
];

const AboutUs = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24">
      <div className="container px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left: big personal heading + journey */}
          <Reveal>
            <p className="eyebrow mb-4">About us</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium font-heading text-foreground leading-[1.05] tracking-tight mb-6">
              Who
              <br />
              we are
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
              <p>
                We're two lifelong Central Ohioans who started NextStep after
                uncovering a potential synergy between local students and businesses. 
                We saw students at our school were high-energy, eager, and looking for opportunities to build high-impact projects with real metrics + business value.
                
                
              </p>
              <p>
                At the same time, we watched local businesses around us struggle
                with backlogs that had grown immensely. We decided to build a platform to harness this energy and create a win-win for both students and businesses.
                . Students build high-impact projects
                that actually matter, and businesses get the extra hands they
                need. 
              </p>
              <p>
                Having lived in this community our entire lives, NextStep is our
                chance to give back to the community one project
                at a time.
              </p>
            </div>
          </Reveal>

          {/* Right: founder cards */}
          <div className="space-y-4 sm:space-y-5">
            {founders.map((founder, i) => (
              <Reveal key={founder.name} delay={0.15 + i * 0.1} className="flat-card flex items-center gap-5 sm:gap-6">
                {founder.photo ? (
                  <img
                    src={founder.photo}
                    alt={`Headshot of ${founder.name}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md border border-border bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground/50">
                    <User className="w-8 h-8" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-medium font-heading text-foreground">
                    {founder.name}
                  </h3>
                  <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground mt-1 mb-3">
                    {founder.role}
                  </p>
                  <div className="flex items-center gap-2">
                    <a
                      href={founder.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                      aria-label={`${founder.name} on LinkedIn`}
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a
                      href={founder.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                      aria-label={`${founder.name}'s personal website`}
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
