import Hero from "@/components/Hero";
import FirstCohortPartners from "@/components/FirstCohortPartners";
import WhatIsNextStep from "@/components/WhatIsNextStep";
import HowItWorks from "@/components/HowItWorks";
import AboutUs from "@/components/AboutUs";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Disclaimer from "@/components/Disclaimer";

const Index = () => {
  return (
    <main className="bg-background min-h-screen">
      <Hero />
      <div className="container py-4 sm:py-6 px-4 sm:px-6">
      </div>
      <FirstCohortPartners />
      <WhatIsNextStep />
      <HowItWorks />
      <AboutUs />
      <FAQ />
      <Footer />
    </main>
  );
};

export default Index;
