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
      "Collaborate with local businesses on meaningful projects that create real impact. Gain hands-on experience while delivering value to your partner organizations.",
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
    <section className="relative py-16 sm:py-20 md:py-28 bg-background">
      {/* Top Flowing Divider */}
      <div className="absolute top-0 left-0 right-0 h-24 sm:h-32 overflow-hidden">
        <svg
          className="absolute top-0 w-full h-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,32 C360,16 720,16 1080,32 C1200,48 1320,48 1440,32 L1440,0 L0,0 Z"
            fill="rgb(240, 235, 225)"
            opacity="0.3"
          />
          <path
            d="M0,64 C240,32 480,32 720,64 C960,96 1200,96 1440,64 L1440,0 L0,0 Z"
            fill="rgb(215, 100, 90)"
            opacity="0.1"
          />
        </svg>
      </div>

      <div className="container relative z-10 px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <span className="inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-primary mb-3 sm:mb-4 bg-nextstep-clay border border-primary/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-warm-sm">
            Your Journey
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-foreground mb-4 sm:mb-6">
            How It Works
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Four simple steps from application to professional growth.
          </p>
        </div>

        {/* Step Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-card p-5 sm:p-7 rounded-2xl border-0 shadow-warm-md hover:shadow-warm-lg transition-all duration-300 group"
            >
              {/* Step Number Badge */}
              <div className="absolute -top-2.5 sm:-top-3 -right-2.5 sm:-right-3 bg-primary text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-warm-sm">
                Step {step.number}
              </div>

              <div className="mt-1 sm:mt-2">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary rounded-xl flex items-center justify-center mb-4 sm:mb-5 shadow-warm-sm group-hover:scale-110 transition-transform duration-300">
                  {(() => {
                    const Icon = iconMap[step.icon as keyof typeof iconMap];
                    return <Icon className="w-6 h-6 sm:w-7 sm:h-7 !text-white" strokeWidth={2.5} style={{ color: 'white', fill: 'none' }} />;
                  })()}
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-heading text-foreground mb-2 sm:mb-3">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Benefits Section */}
        <div className="mt-12 sm:mt-16 md:mt-20 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/50 border border-primary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10">
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-foreground mb-5 sm:mb-6 text-center">
              What You'll Gain
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5 sm:mt-2"></div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-foreground mb-0.5 sm:mb-1">Professional Portfolio</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Real client work and measurable results to showcase
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5 sm:mt-2"></div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-foreground mb-0.5 sm:mb-1">Industry Connections</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Network with local business leaders and professionals
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5 sm:mt-2"></div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-foreground mb-0.5 sm:mb-1">Interview Stories</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Concrete examples of impact and problem-solving
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5 sm:mt-2"></div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-foreground mb-0.5 sm:mb-1">Practical Skills</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
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
