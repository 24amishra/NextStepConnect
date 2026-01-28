import { Linkedin, Mail, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/NextStepLogo.png";

const Hero = () => {
  const scrollToForm = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="min-h-screen flex flex-col relative">
      {/* Navigation */}
      <nav className="container py-6 flex items-center justify-between">
        <img src={logo} alt="NextStep Logo" className="h-12 w-auto" />
        <div className="flex items-center gap-3">
          <Link to="/business/login">
            <Button variant="outline" size="sm">
              Business Login
            </Button>
          </Link>
          <a
            href="https://www.linkedin.com/company/nextstepconnects/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-full border border-border hover:bg-secondary transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-5 h-5 text-foreground" />
          </a>
          <a
            href="mailto:nextstep.connects@gmail.com"
            className="p-2.5 rounded-full border border-border hover:bg-secondary transition-colors"
            aria-label="Email"
          >
            <Mail className="w-5 h-5 text-foreground" />
          </a>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="flex-1 container flex flex-col justify-center pb-4">
        <div className="max-w-4xl">
          <p
            className="text-sm font-semibold uppercase tracking-widest text-primary mb-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0s" }}
          >
            Connecting Students & Businesses
          </p>
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold font-heading text-foreground leading-[1.1] mb-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Empower Local Talent.{" "}
            <span className="text-primary">Elevate Your Business.</span>
          </h1>

          <p
            className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            It's a win-win: fresh ideas and capabilities for your business or organization, meaningful professional growth for ambitious learners.
          </p>

          {/* Launch Announcement */}
          <div
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-3 mb-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <span className="text-sm font-medium text-primary">
              🚀 Launching February 2026
            </span>
          </div>

          {/* Interest Form Notification */}
          <div
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-3 mb-8 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <span className="text-sm font-medium text-primary">
              📝 Interest form available below
            </span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="container pb-8 flex justify-center opacity-0 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
        <button
          onClick={scrollToForm}
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
          aria-label="Scroll to interest form"
        >
          <span className="text-sm font-medium">Scroll for Interest Form</span>
          <ChevronDown className="w-6 h-6 animate-bounce group-hover:text-primary" />
        </button>
      </div>
    </section>
  );
};

export default Hero;
