const phases = [
  {
    number: "01",
    title: "Discovery",
    description:
      "You tell us what projects or tasks your business needs help with.",
  },
  {
    number: "02",
    title: "Connection",
    description:
      "We match you with a motivated student whose skills and goals align with your needs.",
  },
  {
    number: "03",
    title: "Execution",
    description:
      "The student completes the project using our professional frameworks and educational resources.",
  },
];

import Reveal from "@/components/Reveal";

const HowItWorks = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-background border-b border-border">
      <div className="container px-4 sm:px-6">
        <Reveal className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
          <p className="eyebrow mb-3">For businesses</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium font-heading text-foreground mb-3 sm:mb-4 tracking-tight">
            Three phases. Zero friction.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            A simple three-phase process designed for seamless collaboration with your business.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
          {phases.map((phase, i) => (
            <Reveal key={phase.number} delay={i * 0.1} className="flat-card">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-primary mb-4">
                Step {phase.number}
              </p>
              <h3 className="text-lg sm:text-xl font-medium font-heading text-foreground mb-2">
                {phase.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {phase.description}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-4 sm:mt-5 border border-border rounded-md p-6 sm:p-7 grid md:grid-cols-[auto_1fr] gap-3 md:gap-10 items-start bg-card">
          <h3 className="text-base sm:text-lg font-medium font-heading text-foreground whitespace-nowrap">
            Flexible Compensation
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Compensation is up to you. Both paid and volunteer opportunities are welcome —
            students join to gain experience and build their portfolios.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default HowItWorks;
