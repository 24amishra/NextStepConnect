const features = [
  {
    label: "01 / Execution",
    title: "Real-World Execution",
    description:
      "We bridge the gap between classroom theory and professional results by placing students directly into projects with local organizations and businesses.",
  },
  {
    label: "02 / Partnership",
    title: "Win-Win Partnership",
    description:
      "Businesses gain fresh perspectives and dedicated support, while students build real-world experience and professional connections. This synergy drives value for both parties.",
  },
  {
    label: "03 / Outcome",
    title: "The Goal",
    description:
      "We help students build resumes they are proud of while providing local organizations with the extra hands and fresh ideas they need to thrive.",
  },
];

import Reveal from "@/components/Reveal";

const WhatIsNextStep = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-nextstep-brick text-background">
      <div className="container px-4 sm:px-6">
        <Reveal className="grid md:grid-cols-2 gap-6 md:gap-12 items-end mb-10 sm:mb-14">
          <div>
            <p className="eyebrow text-background/60 mb-3">What is NextStep</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium font-heading text-white leading-tight tracking-tight">
              Backlog cleared.
              <br />
              Careers launched.
            </h2>
          </div>
          <p className="text-sm sm:text-base text-background/70 leading-relaxed md:pb-1">
            We partner with small businesses in the community to help alleviate their backlog,
            while giving ambitious students the chance to own and deliver real business value.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((feature, i) => (
            <Reveal
              key={feature.title}
              delay={i * 0.1}
              className="border border-background/20 rounded-md p-6 sm:p-7 bg-background/5"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-background/50 mb-4">
                {feature.label}
              </p>
              <h3 className="text-lg sm:text-xl font-medium font-heading text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-background/70 leading-relaxed">
                {feature.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIsNextStep;
