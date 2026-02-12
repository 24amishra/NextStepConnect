import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Code,
  Palette,
  Camera,
  TrendingUp,
  ExternalLink,
  FileText,
  Lightbulb,
  Target
} from "lucide-react";

const EducationalResources = () => {
  const portfolioTips = [
    {
      title: "Showcase Your Best Work",
      description: "Quality over quantity - include 3-5 strong projects that demonstrate your skills.",
      icon: Target,
    },
    {
      title: "Tell the Story",
      description: "For each project, explain the problem, your approach, and the results achieved.",
      icon: Lightbulb,
    },
    {
      title: "Keep It Updated",
      description: "Regularly add new projects and remove outdated work to keep your portfolio fresh.",
      icon: TrendingUp,
    },
    {
      title: "Make It Accessible",
      description: "Use a simple, clean design that works on all devices and loads quickly.",
      icon: FileText,
    },
  ];

  const learningModules = [
    {
      category: "Web Development",
      icon: Code,
      resources: [
        { name: "freeCodeCamp", url: "https://www.freecodecamp.org/", description: "Free coding courses and certifications" },
        { name: "MDN Web Docs", url: "https://developer.mozilla.org/", description: "Comprehensive web development documentation" },
        { name: "The Odin Project", url: "https://www.theodinproject.com/", description: "Full-stack development curriculum" },
      ],
    },
    {
      category: "Design",
      icon: Palette,
      resources: [
        { name: "Figma Learn", url: "https://help.figma.com/hc/en-us/categories/360002051613", description: "Design tool tutorials and guides" },
        { name: "Canva Design School", url: "https://www.canva.com/designschool/", description: "Graphic design fundamentals" },
        { name: "Google UX Design", url: "https://www.coursera.org/google-certificates/ux-design-certificate", description: "Professional UX/UI design course" },
      ],
    },
    {
      category: "Marketing",
      icon: TrendingUp,
      resources: [
        { name: "HubSpot Academy", url: "https://academy.hubspot.com/", description: "Free marketing courses and certifications" },
        { name: "Google Analytics Academy", url: "https://analytics.google.com/analytics/academy/", description: "Analytics and data-driven marketing" },
        { name: "Meta Blueprint", url: "https://www.facebook.com/business/learn", description: "Social media marketing certification" },
      ],
    },
    {
      category: "Photography & Video",
      icon: Camera,
      resources: [
        { name: "YouTube Creator Academy", url: "https://creatoracademy.youtube.com/", description: "Video production and editing" },
        { name: "Adobe Creative Cloud Tutorials", url: "https://helpx.adobe.com/creative-cloud/tutorials-explore.html", description: "Photo and video editing software" },
        { name: "Photography Basics", url: "https://www.reddit.com/r/photoclass/", description: "Free photography course on Reddit" },
      ],
    },
  ];

  const mockupLibrary = [
    { name: "Unsplash", url: "https://unsplash.com/", description: "Free high-quality stock photos" },
    { name: "Pexels", url: "https://www.pexels.com/", description: "Free stock photos and videos" },
    { name: "Mockuper.net", url: "https://mockuper.net/", description: "Free mockup templates" },
    { name: "Freepik", url: "https://www.freepik.com/", description: "Free graphic resources and templates" },
    { name: "UI8", url: "https://ui8.net/", description: "Premium and free design resources" },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <BookOpen className="h-5 w-5 text-primary" />
          Learning Resources
        </CardTitle>
        <CardDescription>Build your skills and create a standout portfolio</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="portfolio">Portfolio Tips</TabsTrigger>
            <TabsTrigger value="learning">Learning Modules</TabsTrigger>
            <TabsTrigger value="mockups">Mockups & Templates</TabsTrigger>
          </TabsList>

          {/* Portfolio Tips */}
          <TabsContent value="portfolio" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolioTips.map((tip) => (
                <Card key={tip.title} className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <tip.icon className="h-5 w-5 text-primary" />
                      {tip.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">Example Portfolio Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="space-y-1">
                  <p className="font-semibold">1. Homepage/Introduction</p>
                  <p className="text-muted-foreground pl-4">Brief bio, photo, and what you do</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">2. Projects Showcase</p>
                  <p className="text-muted-foreground pl-4">3-5 featured projects with images and descriptions</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">3. Skills & Tools</p>
                  <p className="text-muted-foreground pl-4">List of your technical skills and tools you use</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">4. Contact Information</p>
                  <p className="text-muted-foreground pl-4">Email, LinkedIn, and other relevant links</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Modules */}
          <TabsContent value="learning" className="space-y-4 mt-4">
            {learningModules.map((module) => (
              <Card key={module.category} className="border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <module.icon className="h-5 w-5 text-primary" />
                    {module.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {module.resources.map((resource) => (
                    <div
                      key={resource.name}
                      className="flex items-start justify-between gap-4 p-3 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{resource.name}</p>
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => window.open(resource.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Mockups & Templates */}
          <TabsContent value="mockups" className="space-y-4 mt-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Free Resources</CardTitle>
                <CardDescription>Templates, mockups, and stock assets for your projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockupLibrary.map((resource) => (
                  <div
                    key={resource.name}
                    className="flex items-start justify-between gap-4 p-3 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{resource.name}</p>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => window.open(resource.url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Pro Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">
                  Always check the license terms before using mockups and templates in client work. Most free resources
                  are fine for portfolio use, but may have restrictions for commercial projects.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EducationalResources;
