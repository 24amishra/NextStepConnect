const features = [
  {
    number: "01",
    title: "Real-world execution",
    description:
      "We bridge the gap between classroom theory and professional results by placing students directly into projects with local organizations and businesses.",
  },
  {
    number: "02",
    title: "Win-win partnership",
    description:
      "Businesses gain fresh perspectives and dedicated support, while students build real-world experience and professional connections.",
  },
  {
    number: "03",
    title: "The goal",
    description:
      "We help students build resumes they're proud of while providing local organizations the extra hands and fresh ideas they need to thrive.",
  },
];

import Reveal from "@/components/Reveal";

const WhatIsNextStep = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-nextstep-brick text-background">
      <div className="container px-4 sm:px-6">
        <Reveal className="grid md:grid-cols-2 gap-6 md:gap-12 items-end mb-12 sm:mb-16">
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

        <Reveal delay={0.1} className="grid sm:grid-cols-3 gap-8 sm:gap-6 sm:divide-x sm:divide-background/15">
          {features.map((feature) => (
            <div key={feature.title} className="sm:px-6 first:pl-0">
              <p className="font-mono text-[11px] text-background/50 mb-3">{feature.number}</p>
              <h3 className="text-lg font-medium font-heading text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-background/70 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export default WhatIsNextStep;
