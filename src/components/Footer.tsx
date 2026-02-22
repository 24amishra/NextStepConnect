import { Button } from "@/components/ui/button";
import { Linkedin, Mail } from "lucide-react";
import logo from "@/assets/NextStepLogo.png";

const Footer = () => {
  return (
    <footer className="py-16 sm:py-20 md:py-28 bg-nextstep-brick text-background pb-24 sm:pb-20 md:pb-28">
      <div className="container px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-nextstep-ember mb-3 sm:mb-4 bg-nextstep-ember/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-warm-sm">
            Join Us
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-extrabold font-heading mb-4 sm:mb-6 px-4">
            Ready to mentor the next generation?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-background/70 mb-8 sm:mb-10 leading-relaxed px-4">
            We are currently building our network of local partners. If you're interested
            in working with a student or learning more about our upcoming projects,
            let us know through our quick interest form.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-4">
            <Button
              size="lg"
              asChild
              className="text-sm sm:text-base px-6 sm:px-8 py-4 sm:py-6 h-auto bg-nextstep-ember hover:bg-primary shadow-warm-md w-full sm:w-auto"
            >
              <a href="https://tally.so/r/rja6gR" target="_blank" rel="noopener noreferrer">
                Express Interest
              </a>
            </Button>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 sm:mt-16 md:mt-20 pt-6 sm:pt-8 border-t border-background/20 flex flex-col items-center justify-center gap-4 sm:gap-6">
          <img src={logo} alt="NextStep Logo" className="h-10 sm:h-12 w-auto" />

          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="https://www.linkedin.com/company/nextstepconnects/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:p-2.5 rounded-full border border-background/30 hover:bg-background/10 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-background" />
            </a>
            <a
              href="mailto:nextstep.connects@gmail.com"
              className="p-2 sm:p-2.5 rounded-full border border-background/30 hover:bg-background/10 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-background" />
            </a>
          </div>

          <p className="text-xs sm:text-sm text-background/60">
            © {new Date().getFullYear()} NextStep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
