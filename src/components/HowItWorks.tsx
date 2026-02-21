import { Search, Users, CheckCircle } from "lucide-react";

const phases = [
  {
    number: "01",
    title: "Discovery",
    icon: Search,
    description:
      "You tell us what projects or tasks your business needs help with.",
  },
  {
    number: "02",
    title: "Connection",
    icon: Users,
    description:
      "We match you with a motivated student whose skills and goals align with your needs.",
  },
  {
    number: "03",
    title: "Execution",
    icon: CheckCircle,
    description:
      "The student completes the project using our professional frameworks and educational resources.",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative py-28 bg-background">
      {/* Top Flowing Divider */}
      <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden">
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

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4 bg-nextstep-clay border border-primary/20 px-4 py-2 rounded-full shadow-warm-sm">
            Process
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold font-heading text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A simple three-phase process designed for seamless collaboration.
          </p>
        </div>

        {/* Phase Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {phases.map((phase, index) => (
            <div
              key={index}
              className="relative bg-card p-8 rounded-2xl border-0 shadow-warm-md hover:shadow-warm-lg transition-all duration-300"
            >
              {/* Phase Number Badge */}
              <div className="absolute -top-4 left-8 bg-primary text-primary-foreground text-sm font-bold px-4 py-1.5 rounded-full shadow-warm-sm">
                Phase {phase.number}
              </div>

              <div className="mt-4">
                <div className="w-12 h-12 bg-nextstep-brick rounded-xl flex items-center justify-center mb-5 shadow-warm-sm">
                  <phase.icon className="w-6 h-6 text-card" />
                </div>
                <h3 className="text-2xl font-bold font-heading text-foreground mb-3">
                  {phase.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {phase.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Flexibility Note */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <div className="bg-nextstep-clay/40 border-0 rounded-2xl p-8 shadow-warm-md">
            <h3 className="text-xl font-bold font-heading text-foreground mb-3">
              Flexible Compensation
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Compensation is entirely up to you. Many organizations work with students on a volunteer basis,
              while others choose to offer payment or stipends. Students join NextStep to gain real-world
              experience and build their portfolios, so both paid and unpaid opportunities are welcome.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
