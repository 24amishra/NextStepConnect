import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Reveal from "@/components/Reveal";

const businessPhases = [
  {
    number: "01",
    title: "Discovery",
    description: "You tell us what projects or tasks your business needs help with.",
  },
  {
    number: "02",
    title: "Connection",
    description: "We match you with a motivated student whose skills and goals align with your needs.",
  },
  {
    number: "03",
    title: "Execution",
    description: "The student completes the project using our professional frameworks and educational resources.",
  },
];

const studentSteps = [
  {
    number: "01",
    title: "Apply",
    description: "Fill out our quick interest form. Tell us about your major, skills, and what kind of projects excite you.",
  },
  {
    number: "02",
    title: "Get matched",
    description: "Meet like-minded students and collaborate on group projects for local businesses of your choice.",
  },
  {
    number: "03",
    title: "Learn & execute",
    description: "Collaborate with local businesses on meaningful projects. Gain hands-on experience while delivering real value.",
  },
  {
    number: "04",
    title: "Grow",
    description: "Build your resume with tangible accomplishments. Network with professionals. Stand out to future employers.",
  },
];

// Placeholder testimonials — replace quotes, names, and roles with real ones.
const testimonials = [
  {
    quote:
      "Working with a real client changed how I think about my major. I have actual results to talk about in interviews now.",
    name: "Student Name",
    role: "Student · Placeholder University",
  },
  {
    quote:
      "The students cleared a backlog we'd been putting off for over a year. Fresh eyes, real energy, real results.",
    name: "Owner Name",
    role: "Owner · Placeholder Business",
  },
];

const StepList = ({ steps }: { steps: typeof businessPhases }) => (
  <div className={`grid gap-4 sm:gap-5 sm:grid-cols-2 ${steps.length > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
    {steps.map((step) => (
      <div key={step.number}>
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-primary mb-3">
          Step {step.number}
        </p>
        <h3 className="text-lg font-medium font-heading text-foreground mb-1.5">{step.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
      </div>
    ))}
  </div>
);

const HowItWorks = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-background border-b border-border">
      <div className="container px-4 sm:px-6">
        <Reveal className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
          <p className="eyebrow mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium font-heading text-foreground mb-3 sm:mb-4 tracking-tight">
            Simple, from either side.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            A short process, whether you're posting a project or picking one up.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <Tabs defaultValue="business" className="w-full">
            <div className="flex justify-center mb-10 sm:mb-12">
              <TabsList>
                <TabsTrigger value="business">For businesses</TabsTrigger>
                <TabsTrigger value="student">For students</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="business" className="mt-0">
              <StepList steps={businessPhases} />
              <div className="mt-8 sm:mt-10 border-t border-border pt-6 sm:pt-7 grid md:grid-cols-[auto_1fr] gap-2 md:gap-10 items-start">
                <h3 className="text-base sm:text-lg font-medium font-heading text-foreground whitespace-nowrap">
                  Flexible compensation
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Compensation is up to you. Both paid and volunteer opportunities are welcome —
                  students join to gain experience and build their portfolios.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="student" className="mt-0">
              <StepList steps={studentSteps} />
            </TabsContent>
          </Tabs>
        </Reveal>

        <Reveal delay={0.15} className="mt-14 sm:mt-16 max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-8 sm:gap-10">
            {testimonials.map((testimonial) => (
              <div key={testimonial.quote} className="border-l-2 border-primary/30 pl-4 sm:pl-5">
                <p className="text-sm sm:text-base text-foreground leading-relaxed mb-3">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground mt-0.5">
                  {testimonial.role}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default HowItWorks;
