import { ImageIcon } from "lucide-react";
import Reveal from "@/components/Reveal";

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

          {/* Right: photo placeholder */}
          <Reveal delay={0.15}>
            <div className="aspect-[4/5] sm:aspect-square md:aspect-[4/5] border border-border rounded-md bg-card flex flex-col items-center justify-center gap-3 text-muted-foreground/60">
              <ImageIcon className="w-8 h-8" />
              <p className="font-mono text-[11px] uppercase tracking-[0.15em]">
                Photo of the founders
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
