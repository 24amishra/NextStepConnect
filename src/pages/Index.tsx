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
    <main className="bg-background min-h-screen">
      {/* Content based on active tab */}
      {activeTab === "business" ? (
        <>
          <Hero />
          <div className="container py-6">
            <Disclaimer />
          </div>
          <WhatIsNextStep />
          <HowItWorks />
          <Footer />
        </>
      ) : (
        <>
          <StudentHero />
          <div className="container py-6">
            <Disclaimer />
          </div>
          <StudentWhatIsNextStep />
          <StudentHowItWorks />
          <StudentFooter />
        </>
      )}

      {/* Floating Tab Switcher */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-card p-2 rounded-2xl shadow-warm-lg border border-border/50">
          <button
            onClick={() => setActiveTab("business")}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === "business"
                ? "bg-primary text-primary-foreground shadow-warm-md"
                : "text-muted-foreground hover:text-foreground hover:bg-nextstep-clay"
            }`}
          >
            For Businesses
          </button>
          <button
            onClick={() => setActiveTab("student")}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === "student"
                ? "bg-primary text-primary-foreground shadow-warm-md"
                : "text-muted-foreground hover:text-foreground hover:bg-nextstep-clay"
            }`}
          >
            For Students
          </button>
        </div>
      </div>
    </main>
  );
};

export default Index;
