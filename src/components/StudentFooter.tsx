import { Button } from "@/components/ui/button";
import { Linkedin, Mail } from "lucide-react";
import logo from "@/assets/NextStepLogo.png";

const StudentFooter = () => {
  return (
    <footer className="py-28 bg-nextstep-brick text-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-nextstep-ember mb-4 bg-nextstep-ember/20 px-4 py-2 rounded-full shadow-warm-sm">
            Take the Next Step
          </span>
          <h2 className="text-4xl md:text-5xl text-white font-extrabold font-heading mb-6">
            Ready to launch your career?
          </h2>
          <p className="text-lg text-background/70 mb-10 leading-relaxed">
            Join a community of ambitious students who are building their futures through
            real-world experience. Fill out our interest form to get started with NextStep.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="text-base px-8 py-6 h-auto bg-nextstep-ember hover:bg-primary shadow-warm-md"
            >
              <a href="https://tally.so/r/LZKD4z" target="_blank" rel="noopener noreferrer">
                Join as a Student
              </a>
            </Button>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-20 pt-8 border-t border-background/20 flex flex-col items-center justify-center gap-6">
          <img src={logo} alt="NextStep Logo" className="h-12 w-auto" />

          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/company/nextstepconnects/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full border border-background/30 hover:bg-background/10 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5 text-background" />
            </a>
            <a
              href="mailto:nextstep.connects@gmail.com"
              className="p-2.5 rounded-full border border-background/30 hover:bg-background/10 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5 text-background" />
            </a>
          </div>

          <p className="text-sm text-background/60">
            © {new Date().getFullYear()} NextStep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default StudentFooter;
