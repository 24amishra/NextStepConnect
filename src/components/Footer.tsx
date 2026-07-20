import { Button } from "@/components/ui/button";
import { Linkedin, Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import logo from "@/assets/images/NextStepLogo.png";

const Footer = () => {
  return (
    <footer className="py-14 sm:py-16 md:py-20 bg-nextstep-brick text-background">
      <div className="container px-4 sm:px-6">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="eyebrow text-background/60 mb-3">Get started</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl text-white font-medium font-heading mb-4 tracking-tight">
            Ready to take the next step?
          </h2>
          <p className="text-sm sm:text-base text-background/70 mb-7 sm:mb-8 leading-relaxed max-w-xl mx-auto">
            Whether you're a business with a backlog or a student building a career,
            NextStep connects you with the people who make it happen. Create an
            account to get started.
          </p>
          <Button
            size="lg"
            asChild
            className="text-sm sm:text-base px-7 sm:px-8 h-11 sm:h-12 rounded-md bg-nextstep-ember hover:bg-primary"
          >
            <Link to="/signup">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Reveal>

        {/* Footer Bottom - structured bar */}
        <div className="mt-12 sm:mt-14 pt-6 sm:pt-8 border-t border-background/20 flex flex-col sm:flex-row items-center justify-between gap-4 pb-16 sm:pb-0">
          <img src={logo} alt="NextStep Logo" className="h-9 sm:h-10 w-auto" />

          <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.15em] text-background/60 order-last sm:order-none">
            © {new Date().getFullYear()} NextStep. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/company/nextstepconnects/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md border border-background/30 hover:bg-background/10 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4 text-background" />
            </a>
            <a
              href="mailto:nextstep.connects@gmail.com"
              className="p-2 rounded-md border border-background/30 hover:bg-background/10 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4 text-background" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
