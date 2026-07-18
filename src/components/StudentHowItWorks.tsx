const steps = [
  {
    number: "01",
    title: "Apply",
    description:
      "Fill out our quick interest form. Tell us about your major, skills, and what kind of projects excite you.",
  },
  {
    number: "02",
    title: "Get Matched",
    description:
      "Meet like-minded students and collaborate on group projects for local businesses of your choice.",
  },
  {
    number: "03",
    title: "Learn & Execute",
    description:
      "Collaborate with local businesses on meaningful projects. Gain hands-on experience while delivering real value.",
  },
  {
    number: "04",
    title: "Grow",
    description:
      "Build your resume with tangible accomplishments. Network with professionals. Stand out to future employers.",
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
  {
    quote:
      "NextStep gave me a project I actually own end-to-end. That's something no classroom assignment ever did.",
    name: "Student Name",
    role: "Student · Placeholder University",
  },
];

import Reveal from "@/components/Reveal";

const StudentHowItWorks = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-background border-b border-border">
      <div className="container px-4 sm:px-6">
        <Reveal className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
          <p className="eyebrow mb-3">For students</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium font-heading text-foreground mb-3 sm:mb-4 tracking-tight">
            Application to career growth.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Four simple steps from application to professional growth.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 0.1} className="flat-card">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-primary mb-4">
                Step {step.number}
              </p>
              <h3 className="text-lg font-medium font-heading text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </Reveal>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-14 sm:mt-16">
          <Reveal className="max-w-2xl mx-auto text-center mb-8 sm:mb-10">
            <p className="eyebrow mb-3">What people say</p>
            <h3 className="text-2xl sm:text-3xl font-medium font-heading text-foreground tracking-tight">
              Hear It From Them
            </h3>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {testimonials.map((testimonial, i) => (
              <Reveal key={testimonial.quote} delay={i * 0.1} className="flat-card flex flex-col">
                <p className="font-heading text-2xl text-primary leading-none select-none mb-3">
                  &ldquo;
                </p>
                <p className="text-sm sm:text-base text-foreground leading-relaxed mb-6">
                  {testimonial.quote}
                </p>
                <div className="mt-auto pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground mt-1">
                    {testimonial.role}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentHowItWorks;
