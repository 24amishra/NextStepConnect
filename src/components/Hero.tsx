import { Button } from "@/components/ui/button";
import logo from "@/assets/NextStepLogo.png";

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="container py-6 flex items-center justify-between">
        <img src={logo} alt="Next Step Logo" className="h-14 w-auto" />
        <Button asChild>
          <a href="https://tally.so" target="_blank" rel="noopener noreferrer">
            Interest Form
          </a>
        </Button>
      </nav>

      {/* Hero Content */}
      <div className="flex-1 container flex flex-col justify-center pb-20">
        <div className="max-w-3xl">
          <h1 
            className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-foreground leading-tight mb-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Empower Local Talent.{" "}
            <span className="text-primary">Elevate Your Business.</span>
          </h1>
          
          <p 
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-10 max-w-2xl opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            Next Step connects ambitious students with local businesses to tackle real-world projects. 
            Fresh perspectives for you; invaluable experience for them.
          </p>
          
          <div 
            className="opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <Button size="lg" asChild className="text-lg px-8 py-6 h-auto">
              <a href="https://tally.so" target="_blank" rel="noopener noreferrer">
                View Interest Form
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
