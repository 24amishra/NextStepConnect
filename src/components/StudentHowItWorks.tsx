const steps = [
  {
    number: "01",
    title: "Apply",
    description:
      "Fill out our quick interest form. Tell us about your major, skills, and what kind of projects excite you.",
  },
  {
    number: "02",
    title: "Get Matched",
    description:
      "Meet like-minded students and collaborate on group projects for local businesses of your choice.",
  },
  {
    number: "03",
    title: "Learn & Execute",
    description:
      "Collaborate with local businesses on meaningful projects. Gain hands-on experience while delivering real value.",
  },
  {
    number: "04",
    title: "Grow",
    description:
      "Build your resume with tangible accomplishments. Network with professionals. Stand out to future employers.",
  },
];

const gains = [
  { title: "Professional Portfolio", description: "Real client work and measurable results to showcase" },
  { title: "Industry Connections", description: "Network with local business leaders and professionals" },
  { title: "Interview Stories", description: "Concrete examples of impact and problem-solving" },
  { title: "Practical Skills", description: "Apply classroom theory to real-world challenges" },
];

import Reveal from "@/components/Reveal";

const StudentHowItWorks = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-background border-b border-border">
      <div className="container px-4 sm:px-6">
        <Reveal className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
          <p className="eyebrow mb-3">For students</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium font-heading text-foreground mb-3 sm:mb-4 tracking-tight">
            Application to career growth.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Four simple steps from application to professional growth.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 0.1} className="flat-card">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-primary mb-4">
                Step {step.number}
              </p>
              <h3 className="text-lg font-medium font-heading text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </Reveal>
          ))}
        </div>

        {/* What You'll Gain — structured 2x2 grid */}
        <div className="mt-14 sm:mt-16">
          <Reveal className="max-w-2xl mx-auto text-center mb-8 sm:mb-10">
            <p className="eyebrow mb-3">The payoff</p>
            <h3 className="text-2xl sm:text-3xl font-medium font-heading text-foreground tracking-tight">
              What You'll Gain
            </h3>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {gains.map((gain, i) => (
              <Reveal key={gain.title} delay={i * 0.08} className="flat-card flex gap-4 items-start">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2"></span>
                <div>
                  <h4 className="font-medium font-heading text-sm sm:text-base text-foreground mb-1">
                    {gain.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{gain.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentHowItWorks;
