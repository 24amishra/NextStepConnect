import Hero from "@/components/Hero";
import FirstCohortPartners from "@/components/FirstCohortPartners";
import WhatIsNextStep from "@/components/WhatIsNextStep";
import HowItWorks from "@/components/HowItWorks";
import StudentHowItWorks from "@/components/StudentHowItWorks";
import AboutUs from "@/components/AboutUs";
import Footer from "@/components/Footer";
import Disclaimer from "@/components/Disclaimer";

const Index = () => {
  return (
    <main className="bg-background min-h-screen">
      <Hero />
      <div className="container py-4 sm:py-6 px-4 sm:px-6">
        <Disclaimer />
      </div>
      <FirstCohortPartners />
      <WhatIsNextStep />
      <HowItWorks />
      <StudentHowItWorks />
      <AboutUs />
      <Footer />
    </main>
  );
};

export default Index;
