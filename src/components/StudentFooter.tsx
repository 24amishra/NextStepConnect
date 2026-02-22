import { Button } from "@/components/ui/button";
import { Linkedin, Mail } from "lucide-react";
import logo from "@/assets/NextStepLogo.png";

const StudentFooter = () => {
  return (
    <footer className="py-16 sm:py-20 md:py-28 bg-nextstep-brick text-background pb-24 sm:pb-20 md:pb-28">
      <div className="container px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-nextstep-ember mb-3 sm:mb-4 bg-nextstep-ember/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-warm-sm">
            Take the Next Step
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-extrabold font-heading mb-4 sm:mb-6 px-4">
            Ready to launch your career?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-background/70 mb-8 sm:mb-10 leading-relaxed px-4">
            Join a community of ambitious students who are building their futures through
            real-world experience. Fill out our interest form to get started with NextStep.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-4">
            <Button
              size="lg"
              asChild
              className="text-sm sm:text-base px-6 sm:px-8 py-4 sm:py-6 h-auto bg-nextstep-ember hover:bg-primary shadow-warm-md w-full sm:w-auto"
            >
              <a href="https://tally.so/r/LZKD4z" target="_blank" rel="noopener noreferrer">
                Join as a Student
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

export default StudentFooter;
