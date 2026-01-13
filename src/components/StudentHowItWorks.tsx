import { ClipboardCheck, Lightbulb, Rocket, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Apply",
    icon: "clipboard-check",
    description:
      "Fill out our quick interest form. Tell us about your major, skills, and what kind of projects excite you.",
  },
  {
    number: "02",
    title: "Get Matched",
    icon: "lightbulb",
    description:
      "Meet like-minded students and collaborate on group projects for local businesses of your choice. Choose who you work with and what projects excite you most.",
  },
  {
    number: "03",
    title: "Learn & Execute",
    icon: "rocket",
    description:
      "Access our Learning Hub with professional frameworks and guides. Work on real projects with real clients.",
  },
  {
    number: "04",
    title: "Grow",
    icon: "trending-up",
    description:
      "Build your resume with tangible accomplishments. Network with professionals. Stand out to future employers.",
  },
];

const iconMap = {
  "clipboard-check": ClipboardCheck,
  "lightbulb": Lightbulb,
  "rocket": Rocket,
  "trending-up": TrendingUp,
};

const StudentHowItWorks = () => {
  return (
    <section className="py-28 bg-secondary/30">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4 bg-primary/10 px-4 py-2 rounded-full">
            Your Journey
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold font-heading text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four simple steps from application to professional growth.
          </p>
        </div>

        {/* Step Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-background p-7 rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
            >
              {/* Step Number Badge */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-br from-primary to-primary/80 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Step {step.number}
              </div>

              <div className="mt-2">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  {(() => {
                    const Icon = iconMap[step.icon as keyof typeof iconMap];
                    return <Icon className="w-7 h-7 !text-white" strokeWidth={2.5} style={{ color: 'white', fill: 'none' }} />;
                  })()}
                </div>
                <h3 className="text-xl font-bold font-heading text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Benefits Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/50 border border-primary/20 rounded-3xl p-10">
            <h3 className="text-2xl font-bold font-heading text-foreground mb-6 text-center">
              What You'll Gain
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Professional Portfolio</h4>
                  <p className="text-sm text-muted-foreground">
                    Real client work and measurable results to showcase
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Industry Connections</h4>
                  <p className="text-sm text-muted-foreground">
                    Network with local business leaders and professionals
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Interview Stories</h4>
                  <p className="text-sm text-muted-foreground">
                    Concrete examples of impact and problem-solving
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Practical Skills</h4>
                  <p className="text-sm text-muted-foreground">
                    Apply classroom theory to real-world challenges
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentHowItWorks;
