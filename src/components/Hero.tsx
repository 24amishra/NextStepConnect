import { Linkedin, Mail, ArrowRight, Building2, TrendingUp, Users, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/NextStepLogo.png";

const Hero = () => {
  return (
    <>
      {/* Navigation - Dark Header */}
      <nav className="bg-nextstep-brick text-background py-3 sm:py-4 sticky top-0 z-50 shadow-warm-md">
        <div className="container flex items-center justify-between">
          <img src={logo} alt="NextStep Logo" className="h-8 sm:h-10 w-auto" />
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link to="/business/login">
              <Button variant="ghost" size="sm" className="text-background hover:bg-background/10 text-xs sm:text-sm px-2 sm:px-4">
                Login
              </Button>
            </Link>
            <a
              href="https://www.linkedin.com/company/nextstepconnects/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:p-2 rounded-full hover:bg-background/10 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-background" />
            </a>
            <a
              href="mailto:nextstep.connects@gmail.com"
              className="p-1.5 sm:p-2 rounded-full hover:bg-background/10 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-background" />
            </a>
            <a
              href="https://www.instagram.com/join.nextstep/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:p-2 rounded-full hover:bg-background/10 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-background" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section - Large, Impactful */}
      <section className="relative bg-background overflow-hidden">
        <div className="container py-12 sm:py-16 md:py-20 lg:py-32 px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6 sm:space-y-8">
              <div
                className="inline-flex items-center gap-2 bg-nextstep-clay border border-primary/20 rounded-full px-3 sm:px-5 py-1.5 sm:py-2 shadow-warm-sm opacity-0 animate-fade-in-up"
                style={{ animationDelay: "0s" }}
              >
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary">
                  Connecting Students & Businesses
                </span>
              </div>

              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold font-heading text-foreground leading-[1.1] opacity-0 animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                Empower Local Talent.{" "}
                <span className="text-primary">Elevate Your Business.</span>
              </h1>

              <p
                className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl opacity-0 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                Fresh ideas and skilled hands for your business. Real-world experience and portfolio growth for ambitious students. It's a win-win.
              </p>

              <div
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 opacity-0 animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base shadow-warm-md w-full sm:w-auto" asChild>
                  <a href="https://tally.so/r/rja6gR" target="_blank" rel="noopener noreferrer">
                    Get Started
                    <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base shadow-warm-sm w-full sm:w-auto">
                  <Link to="https://www.linkedin.com/company/nextstepconnects/" target="_blank" rel="noopener noreferrer">Learn More</Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div
                className="flex flex-wrap gap-4 sm:gap-6 pt-2 sm:pt-4 opacity-0 animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-foreground">Local Businesses</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Trusted Partners</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-foreground">Skilled Students</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Ready to Work</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Visual Element */}
            <div
              className="relative opacity-0 animate-fade-in-up mt-8 lg:mt-0"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="relative max-w-md mx-auto lg:max-w-none">
                {/* Geometric shapes background */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 sm:w-64 sm:h-64 bg-primary/10 rounded-full blur-3xl"></div>
                </div>

                {/* Main visual card */}
                <div className="relative bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-warm-lg border-0">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-warm-md">
                      <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2">Growing Together</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        NextStep creates meaningful connections between ambitious students and local organizations.
                      </p>
                    </div>

                  </div>
                </div>

                {/* Floating accent cards */}
                <div className="absolute -top-3 -right-3 sm:-top-6 sm:-right-6 bg-nextstep-clay rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-warm-md">
                  <p className="text-xs sm:text-sm font-semibold text-primary">🚀 Launching Feb 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flowing Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
          <svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,64 C240,96 480,96 720,64 C960,32 1200,32 1440,64 L1440,120 L0,120 Z"
              fill="rgb(240, 235, 225)"
              opacity="0.5"
            />
          </svg>
        </div>
      </section>
    </>
  );
};

export default Hero;
