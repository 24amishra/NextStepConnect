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
          <div className="container py-4 sm:py-6 px-4 sm:px-6">
            <Disclaimer />
          </div>
          <WhatIsNextStep />
          <HowItWorks />
          <Footer />
        </>
      ) : (
        <>
          <StudentHero />
          <div className="container py-4 sm:py-6 px-4 sm:px-6">
            <Disclaimer />
          </div>
          <StudentWhatIsNextStep />
          <StudentHowItWorks />
          <StudentFooter />
        </>
      )}

      {/* Floating Tab Switcher */}
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto max-w-md">
        <div className="flex items-center gap-1 sm:gap-2 bg-card p-1.5 sm:p-2 rounded-2xl shadow-warm-lg border border-border/50">
          <button
            onClick={() => setActiveTab("business")}
            className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === "business"
                ? "bg-primary text-primary-foreground shadow-warm-md"
                : "text-muted-foreground hover:text-foreground hover:bg-nextstep-clay"
            }`}
          >
            <span className="hidden sm:inline">For Businesses</span>
            <span className="sm:hidden">Businesses</span>
          </button>
          <button
            onClick={() => setActiveTab("student")}
            className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === "student"
                ? "bg-primary text-primary-foreground shadow-warm-md"
                : "text-muted-foreground hover:text-foreground hover:bg-nextstep-clay"
            }`}
          >
            <span className="hidden sm:inline">For Students</span>
            <span className="sm:hidden">Students</span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default Index;
