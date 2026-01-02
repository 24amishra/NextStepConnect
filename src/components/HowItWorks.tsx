const phases = [
  {
    number: "01",
    title: "Discovery",
    description:
      "You tell us what projects or tasks your business needs help with.",
  },
  {
    number: "02",
    title: "Connection",
    description:
      "We match you with a motivated student whose skills and goals align with your needs.",
  },
  {
    number: "03",
    title: "Execution",
    description:
      "The student completes the project using our professional frameworks and educational resources.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A simple three-phase process designed for seamless collaboration.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {phases.map((phase, index) => (
            <div key={index} className="relative">
              {/* Connector line for desktop */}
              {index < phases.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-border" />
              )}
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary text-primary-foreground text-3xl font-bold mb-6">
                  {phase.number}
                </div>
                <h3 className="text-2xl font-semibold font-heading text-foreground mb-4">
                  {phase.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  {phase.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
