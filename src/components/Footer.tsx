import { Button } from "@/components/ui/button";
import logo from "@/assets/NextStepLogo.png";

const Footer = () => {
  return (
    <footer className="py-24 bg-foreground text-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            Ready to mentor the next generation?
          </h2>
          <p className="text-lg text-background/80 mb-10 leading-relaxed">
            We are currently building our network of local partners. If you're interested 
            in working with a student or learning more about our upcoming projects, 
            let us know through our quick interest form.
          </p>
          <Button 
            size="lg" 
            asChild 
            className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90"
          >
            <a href="https://tally.so" target="_blank" rel="noopener noreferrer">
              Interest Form
            </a>
          </Button>
        </div>

        {/* Footer Bottom */}
        <div className="mt-20 pt-8 border-t border-background/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <img src={logo} alt="Next Step Logo" className="h-10 w-auto brightness-0 invert" />
          <p className="text-sm text-background/60">
            © {new Date().getFullYear()} Next Step. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
