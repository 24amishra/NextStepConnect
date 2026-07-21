import { ArrowRight, Briefcase, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import logo from "@/assets/images/NextStepLogo.png";

const options = [
  {
    icon: GraduationCap,
    label: "For students",
    title: "Student Account",
    description:
      "Work on real projects for local businesses, build your portfolio, and gain professional experience.",
    to: "/student/signup",
    cta: "Sign up as a student",
  },
  {
    icon: Briefcase,
    label: "For businesses",
    title: "Business Account",
    description:
      "Get fresh ideas and skilled hands for your backlog by partnering with motivated local students.",
    to: "/business/signup",
    cta: "Sign up as a business",
  },
];

const SignupChoice = () => {
  return (
    <main className="min-h-screen bg-background">
      <nav className="bg-nextstep-brick text-background py-3 sm:py-4">
        <div className="container flex items-center justify-between px-4 sm:px-6">
          <Link to="/">
            <img src={logo} alt="NextStep Logo" className="h-8 sm:h-10 w-auto" />
          </Link>
          <Link
            to="/"
            className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.15em] text-background/70 hover:text-background transition-colors"
          >
            Back to home
          </Link>
        </div>
      </nav>

      <section className="container px-4 sm:px-6 py-16 sm:py-20 md:py-24">
        <Reveal className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
          <p className="eyebrow mb-3">Get started</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium font-heading text-foreground mb-3 sm:mb-4 tracking-tight">
            Create your account
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Choose the account type that fits you. You can always reach out if
            you're not sure which one is right.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 max-w-3xl mx-auto">
          {options.map((option, i) => (
            <Reveal key={option.title} delay={i * 0.1}>
              <Link
                to={option.to}
                className="flat-card flex flex-col h-full group hover:border-primary transition-colors"
              >
                <option.icon className="w-6 h-6 text-primary mb-4" />
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                  {option.label}
                </p>
                <h2 className="text-lg sm:text-xl font-medium font-heading text-foreground mb-2">
                  {option.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {option.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  {option.cta}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="text-center mt-10">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/student/login" className="text-primary font-semibold hover:underline">
              Student login
            </Link>{" "}
            ·{" "}
            <Link to="/business/login" className="text-primary font-semibold hover:underline">
              Business login
            </Link>
          </p>
        </Reveal>
      </section>
    </main>
  );
};

export default SignupChoice;
