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
    <section className="py-28">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4 bg-primary/10 px-4 py-2 rounded-full">
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
              className="relative bg-secondary/50 p-8 rounded-2xl border border-border hover:bg-secondary transition-colors duration-300"
            >
              {/* Phase Number Badge */}
              <div className="absolute -top-4 left-8 bg-primary text-primary-foreground text-sm font-bold px-4 py-1.5 rounded-full">
                Phase {phase.number}
              </div>

              <div className="mt-4">
                <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center mb-5">
                  <phase.icon className="w-6 h-6 text-background" />
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
          <div className="bg-secondary/30 border border-border rounded-2xl p-8">
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
