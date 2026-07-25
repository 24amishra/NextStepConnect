import { Linkedin, Mail, ArrowRight, Instagram, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTypingAnimation } from "@/hooks/useTypingAnimation";
import Reveal from "@/components/Reveal";
import logo from "@/assets/images/NextStepLogo.png";

const words = ["content", "websites", "value"];

const Hero = () => {
  const typingText = useTypingAnimation(words);

  return (
    <>
      {/* Navigation - Dark Header */}
      <nav className="bg-nextstep-brick text-background py-3 sm:py-4 sticky top-0 z-50">
        <div className="container flex items-center justify-between px-4 sm:px-6">
          <img src={logo} alt="NextStep Logo" className="h-8 sm:h-10 w-auto" />
          <div className="flex items-center gap-1 sm:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-background hover:bg-background/10 text-xs sm:text-sm px-2 sm:px-3 gap-1">
                  Log In
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/student/login">Student Login</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/business/login">Business Login</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/signup">
              <Button size="sm" className="text-xs sm:text-sm px-3 sm:px-4">
                Sign Up
              </Button>
            </Link>
            <a
              href="https://www.linkedin.com/company/nextstepconnects/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block p-2 rounded-full hover:bg-background/10 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-background" />
            </a>
            <a
              href="mailto:nextstep.connects@gmail.com"
              className="hidden sm:block p-2 rounded-full hover:bg-background/10 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-background" />
            </a>
            <a
              href="https://www.instagram.com/join.nextstep/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block p-2 rounded-full hover:bg-background/10 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-background" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section - Compact, Typography-Driven */}
      <section className="bg-background border-b border-border">
        <div className="container py-14 sm:py-16 md:py-24 px-4 sm:px-6">
          <Reveal className="max-w-3xl mx-auto text-center space-y-5 sm:space-y-6">
            <p className="eyebrow">Students × Local businesses</p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium font-heading text-foreground leading-[1.08] tracking-tight">
              Build{" "}
              <span className="text-primary">{typingText}</span>
              <span className="text-primary animate-blink-cursor">|</span>
              <br />
              <span className="text-muted-foreground">for the businesses that need it.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Fresh ideas and skilled hands for your business. Real-world experience for ambitious students.
            </p>

            <div className="pt-1">
              <Button size="lg" className="h-11 sm:h-12 px-7 sm:px-8 text-sm sm:text-base rounded-md" asChild>
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center divide-x divide-border pt-3">
              {["Student-led", "Business-valued","Impact-driven"].map((item) => (
                <span
                  key={item}
                  className="px-3 sm:px-5 font-mono text-[11px] sm:text-xs uppercase tracking-[0.15em] text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};

export default Hero;
