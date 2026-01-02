import { Button } from "@/components/ui/button";
import { Linkedin, Mail } from "lucide-react";
import logo from "@/assets/NextStepLogo.png";

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="container py-6 flex items-center justify-between">
        <img src={logo} alt="Next Step Logo" className="h-12 w-auto" />
        <div className="flex items-center gap-3">
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
          <Button asChild className="ml-2">
            <a href="https://tally.so" target="_blank" rel="noopener noreferrer">
              Express Interest
            </a>
          </Button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="flex-1 container flex flex-col justify-center pb-20">
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
            className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            Next Step connects ambitious students with local businesses to tackle real-world projects. 
            Fresh perspectives for you; invaluable experience for them.
          </p>
          
          <div 
            className="flex flex-wrap gap-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <Button size="lg" asChild className="text-base px-8 py-6 h-auto">
              <a href="https://tally.so" target="_blank" rel="noopener noreferrer">
                Express Interest
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8 py-6 h-auto">
              <a href="mailto:nextstep.connects@gmail.com">
                Get in Touch
              </a>
            </Button>
          </div>
          <p 
            className="text-sm text-muted-foreground mt-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            We'll notify you when NextStep is ready in your area. Submitting does not guarantee immediate access.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
