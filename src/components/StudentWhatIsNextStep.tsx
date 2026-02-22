import { Briefcase, GraduationCap, Award, Heart } from "lucide-react";

const benefits = [
  {
    icon: "briefcase",
    title: "Real-World Experience",
    description:
      "Go beyond theory. Work on actual projects for local businesses and organizations, gaining hands-on experience that sets you apart in today's competitive job market.",
  },
  {
    icon: "graduation-cap",
    title: "All Majors Welcome",
    description:
      "Whether you're studying business, computer science, design, communications, or any other field—we have opportunities that match your skills and interests.",
  },
  {
    icon: "award",
    title: "Resume & Portfolio Builder",
    description:
      "Build a portfolio of real client work you can showcase. Gain tangible results and accomplishments to discuss in interviews and future career opportunities.",
  },
  {
    icon: "heart",
    title: "Community Impact",
    description:
      "Use what you're learning to help local businesses succeed. Make a meaningful difference while developing professional skills and building lasting connections.",
  },
];

const iconMap = {
  "briefcase": Briefcase,
  "graduation-cap": GraduationCap,
  "award": Award,
  "heart": Heart,
};

const StudentWhatIsNextStep = () => {
  return (
    <section className="relative py-16 sm:py-20 md:py-28 bg-nextstep-clay/30">
      {/* Top Flowing Divider */}
      <div className="absolute top-0 left-0 right-0 h-20 sm:h-24 overflow-hidden">
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

      <div className="container relative z-10 px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <span className="inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-primary mb-3 sm:mb-4 bg-nextstep-clay border border-primary/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-warm-sm">
            For Students
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-foreground mb-4 sm:mb-6">
            Why Join NextStep?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            NextStep bridges the gap between classroom learning and professional success,
            giving you the experience employers actually want to see.
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group bg-card p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-0 shadow-warm-md hover:shadow-warm-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-warm-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                {(() => {
                  const Icon = iconMap[benefit.icon as keyof typeof iconMap];
                  return <Icon className="w-6 h-6 sm:w-8 sm:h-8 !text-white" strokeWidth={2.5} style={{ color: 'white', fill: 'none' }} />;
                })()}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-foreground mb-3 sm:mb-4">
                {benefit.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Compensation Callout */}
        <div className="mt-12 sm:mt-16 md:mt-20 max-w-3xl mx-auto">
          <div className="bg-nextstep-clay/60 border-0 shadow-warm-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-center">
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-foreground mb-3 sm:mb-4">
              Paid in Experience
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
              This is a volunteer service where your compensation comes in the form of invaluable
              professional experience, portfolio pieces, and real-world skills. The connections you
              make and the work you complete will open doors throughout your career.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Flowing Divider */}
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

export default StudentWhatIsNextStep;
