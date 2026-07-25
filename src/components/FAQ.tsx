import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Reveal from "@/components/Reveal";

const faqs = [
  {
    label: "For students",
    question: "Do I get paid?",
    answer:
      "Compensation is worked out directly with the business. Both paid and volunteer projects are available, and either way you walk away with a real deliverable for your portfolio.",
  },
  {
    label: "For students",
    question: "How do I get matched with a project?",
    answer:
      "Apply with your major, skills, and interests, and we'll match you with a business project that fits.",
  },
  {
    label: "For businesses",
    question: "What does this cost?",
    answer:
      "Compensation is entirely up to you and the student you work with. Paid and volunteer arrangements are both welcome.",
  },
  {
    label: "For businesses",
    question: "Is NextStep involved in the contract or liability?",
    answer:
      "No. NextStep is a nonprofit connector that doesn't sign contracts or manage agreements. Arrangements are made directly between you and the student.",
  },
  {
    label: "General",
    question: "How does the matching process work?",
    answer:
      "Discovery, Connection, Execution: you share what you need, we match you with an aligned student, and they execute using our frameworks and resources.",
  },
  {
    label: "General",
    question: "How do I sign up?",
    answer: "Hit Sign Up and choose Student or Business. It takes under a minute.",
  },
];

const FAQ = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 border-t border-border bg-background">
      <div className="container px-4 sm:px-6">
        <Reveal className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
          <p className="eyebrow mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium font-heading text-foreground mb-3 sm:mb-4 tracking-tight">
            Common questions.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            For students and businesses considering NextStep.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.question} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-heading text-base sm:text-lg hover:no-underline">
                  <span className="flex flex-col items-start gap-1 text-left">
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-primary">
                      {faq.label}
                    </span>
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
};

export default FAQ;
