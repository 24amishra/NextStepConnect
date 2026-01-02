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
      "Unlike traditional internships, our students are backed by the Next Step Learning Hub. We provide \"how-to\" guides for every deliverable, ensuring your organization receives high-quality, professional work.",
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
    <section className="py-28 bg-secondary/50">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4 bg-primary/10 px-4 py-2 rounded-full">
            About Us
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold font-heading text-foreground mb-6">
            What is Next Step?
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
              className="group bg-background p-8 rounded-2xl border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
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
    </section>
  );
};

export default WhatIsNextStep;
