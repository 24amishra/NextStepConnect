import { Target, BookOpen, Rocket } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Real-World Execution",
    description:
      "We bridge the gap between classroom theory and professional results by placing students directly into projects with local organizations and businesses.",
  },
  {
    icon: BookOpen,
    title: "The Educational Framework",
    description:
      "Unlike traditional internships, our students are backed by the NextStep Learning Hub. We provide \"how-to\" guides for every deliverable, ensuring your organization receives high-quality, professional work.",
  },
  {
    icon: Rocket,
    title: "The Goal",
    description:
      "We help students build resumes they are proud of while providing local organizations and businesses with the extra hands and fresh ideas they need to thrive.",
  },
];

const WhatIsNextStep = () => {
  return (
    <section className="relative py-28 bg-nextstep-clay/30">
      {/* Top Flowing Divider */}
      <div className="absolute top-0 left-0 right-0 h-24 overflow-hidden">
        <svg
          className="absolute top-0 w-full h-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,64 C240,32 480,32 720,64 C960,96 1200,96 1440,64 L1440,0 L0,0 Z"
            fill="rgb(228, 222, 212)"
          />
        </svg>
      </div>

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4 bg-nextstep-clay border border-primary/20 px-4 py-2 rounded-full shadow-warm-sm">
            About Us
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold font-heading text-foreground mb-6">
            What is NextStep?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            "We aren't just a matching service; we are a launchpad."
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card p-8 rounded-2xl border-0 hover:shadow-warm-lg shadow-warm-md transition-all duration-300"
            >
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6 shadow-warm-sm group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-[15px]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Flowing Divider - Warm Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,32 C360,80 720,80 1080,32 C1200,16 1320,16 1440,32 L1440,120 L0,120 Z"
            fill="rgb(228, 222, 212)"
          />
          <path
            d="M0,64 C240,96 480,96 720,64 C960,32 1200,32 1440,64 L1440,120 L0,120 Z"
            fill="rgb(215, 100, 90)"
            opacity="0.15"
          />
        </svg>
      </div>
    </section>
  );
};

export default WhatIsNextStep;
