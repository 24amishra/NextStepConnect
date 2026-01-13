import { Briefcase, GraduationCap, Award, Heart } from "lucide-react";

const benefits = [
  {
    icon: Briefcase,
    title: "Real-World Experience",
    description:
      "Go beyond theory. Work on actual projects for local businesses and organizations, gaining hands-on experience that sets you apart in today's competitive job market.",
  },
  {
    icon: GraduationCap,
    title: "All Majors Welcome",
    description:
      "Whether you're studying business, computer science, design, communications, or any other field—we have opportunities that match your skills and interests.",
  },
  {
    icon: Award,
    title: "Resume & Portfolio Builder",
    description:
      "Build a portfolio of real client work you can showcase. Gain tangible results and accomplishments to discuss in interviews and future career opportunities.",
  },
  {
    icon: Heart,
    title: "Community Impact",
    description:
      "Use what you're learning to help local businesses succeed. Make a meaningful difference while developing professional skills and building lasting connections.",
  },
];

const StudentWhatIsNextStep = () => {
  return (
    <section className="py-28 bg-gradient-to-b from-background to-secondary/20">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4 bg-primary/10 px-4 py-2 rounded-full">
            For Students
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold font-heading text-foreground mb-6">
            Why Join NextStep?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            NextStep bridges the gap between classroom learning and professional success,
            giving you the experience employers actually want to see.
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group bg-background p-8 rounded-3xl border-2 border-border hover:border-primary/40 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <benefit.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-foreground mb-4">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-base">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Compensation Callout */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-secondary/50 to-primary/5 border-2 border-primary/20 rounded-3xl p-10 text-center">
            <h3 className="text-2xl font-bold font-heading text-foreground mb-4">
              Paid in Experience
            </h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              This is a volunteer service where your compensation comes in the form of invaluable
              professional experience, portfolio pieces, and real-world skills. The connections you
              make and the work you complete will open doors throughout your career.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentWhatIsNextStep;
