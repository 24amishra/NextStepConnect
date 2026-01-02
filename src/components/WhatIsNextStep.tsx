import { Target, BookOpen, Rocket } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Real-World Execution",
    description:
      "We bridge the gap between classroom theory and professional results by placing students directly into local business projects.",
  },
  {
    icon: BookOpen,
    title: "The Educational Framework",
    description:
      "Unlike traditional internships, our students are backed by the Next Step Learning Hub. We provide \"how-to\" guides for every deliverable, ensuring your business receives high-quality, professional work.",
  },
  {
    icon: Rocket,
    title: "The Goal",
    description:
      "We help students build resumes they are proud of while providing local businesses with the extra hands and fresh ideas they need to thrive.",
  },
];

const WhatIsNextStep = () => {
  return (
    <section className="py-24 bg-secondary">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-6">
            What is Next Step?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto italic">
            "We aren't just a matching service; we are a launchpad."
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-background p-8 rounded-lg border border-border hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold font-heading text-foreground mb-4">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
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
