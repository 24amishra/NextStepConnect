import { useState } from "react";
import Hero from "@/components/Hero";
import WhatIsNextStep from "@/components/WhatIsNextStep";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import StudentHero from "@/components/StudentHero";
import StudentWhatIsNextStep from "@/components/StudentWhatIsNextStep";
import StudentHowItWorks from "@/components/StudentHowItWorks";
import StudentFooter from "@/components/StudentFooter";
import Disclaimer from "@/components/Disclaimer";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"business" | "student">("business");

  return (
    <main className="bg-background">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-center gap-2 bg-secondary/50 p-1 rounded-lg max-w-md mx-auto">
            <button
              onClick={() => setActiveTab("business")}
              className={`flex-1 px-6 py-3 rounded-md text-sm font-semibold transition-all duration-200 ${
                activeTab === "business"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              For Businesses
            </button>
            <button
              onClick={() => setActiveTab("student")}
              className={`flex-1 px-6 py-3 rounded-md text-sm font-semibold transition-all duration-200 ${
                activeTab === "student"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              For Students
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="container py-4">
        <Disclaimer />
      </div>

      {/* Content based on active tab */}
      {activeTab === "business" ? (
        <>
          <Hero />
          <WhatIsNextStep />
          <HowItWorks />
          <Footer />
        </>
      ) : (
        <>
          <StudentHero />
          <StudentWhatIsNextStep />
          <StudentHowItWorks />
          <StudentFooter />
        </>
      )}
    </main>
  );
};

export default Index;
