import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { CompanyCarousel } from "@/components/company-carousel";
import {
  ArrowRight,
  ChevronRight,
  Kanban,
  Zap,
  ShieldCheck,
  BarChart3,
  Users,
  Sparkles,
  Layers,
} from "lucide-react";

const features = [
  {
    title: "Visual Kanban Boards",
    description:
      "Drag-and-drop tasks across custom workflow stages. Spot bottlenecks instantly and optimize your team's velocity with agile columns.",
    icon: Kanban,
    iconColor: "text-purple-400 bg-purple-600/10 border-purple-500/20",
  },
  {
    title: "Sprint Cycles & Planning",
    description:
      "Plan, start, and complete sprints with predictability. Automatically roll over unfinished tasks into the backlog without losing context.",
    icon: Zap,
    iconColor: "text-indigo-400 bg-indigo-600/10 border-indigo-500/20",
  },
  {
    title: "Issue Tracking & Priority",
    description:
      "Categorize issues with Low, Medium, High, and Urgent priority flags. Filter tickets on the fly by status, assignee, or sprint.",
    icon: Layers,
    iconColor: "text-fuchsia-400 bg-fuchsia-600/10 border-fuchsia-500/20",
  },
  {
    title: "Organizations & Teams",
    description:
      "Multi-tenant architecture powered by Clerk. Create dedicated workspaces for organizations, departments, and cross-functional teams.",
    icon: Users,
    iconColor: "text-purple-400 bg-purple-600/10 border-purple-500/20",
  },
  {
    title: "Enterprise Serverless DB",
    description:
      "Powered by serverless Neon PostgreSQL and Prisma ORM. Instant connection pooling, high availability, and SSL encryption.",
    icon: ShieldCheck,
    iconColor: "text-emerald-400 bg-emerald-600/10 border-emerald-500/20",
  },
  {
    title: "Velocity & Insights",
    description:
      "Track burndown rates and throughput over time. Identify blockers before they turn into sprint delivery delays.",
    icon: BarChart3,
    iconColor: "text-amber-400 bg-amber-600/10 border-amber-500/20",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Background Dotted Pattern & Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff18_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-purple-600/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 -left-48 w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-2/3 -right-48 w-[450px] h-[450px] bg-purple-700/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-20 md:pt-28 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 backdrop-blur-md text-xs sm:text-sm font-medium text-purple-300 mb-8 shadow-sm shadow-purple-500/10 hover:border-purple-500/50 transition-colors">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>The Next-Generation Agile Platform</span>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
        </div>

        {/* Hero Main Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.12]">
          Turn your plans into action with{" "}
          <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
            YOJNA
          </span>
        </h1>

        {/* Hero Subheading */}
        <p className="mt-6 text-lg sm:text-xl md:text-2xl text-slate-400 max-w-2xl leading-relaxed font-normal">
          Streamline workflows, track progress and deliver projects faster with the power of YOJNA.
        </p>

        {/* Call to Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* Primary CTA: Get Started */}
          <Link href="/onboarding" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 border-0 flex items-center justify-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>

          {/* Secondary CTA: Learn More */}
          <a href="#features" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-base font-medium border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:text-white text-slate-300 rounded-xl backdrop-blur-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Learn More</span>
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </Button>
          </a>
        </div>
      </section>

      {/* Key Features Section with shadcn/ui Cards */}
      <section id="features" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="px-3 py-1 text-xs uppercase tracking-wider border-purple-500/30 text-purple-400 mb-4">
            Key Features
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100">
            Engineered for high-performing agile squads
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            From sprint backlogs to real-time execution, YOJNA equips your team with the precision tools needed to build what matters.
          </p>
        </div>

        {/* Feature Cards Grid built with shadcn/ui Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="bg-slate-900/60 border-slate-800/80 hover:border-purple-500/40 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 group rounded-2xl"
              >
                <CardHeader className="pb-2">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${feature.iconColor}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Companies Carousel using shadcn/ui Carousel */}
      <CompanyCarousel />

      {/* Bottom CTA Banner */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/40 to-slate-900/80 backdrop-blur-xl p-8 sm:p-14 shadow-2xl shadow-purple-900/30">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-50 tracking-tight">
            Ready to accelerate your workflow?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
            Join modern teams building and shipping faster with YOJNA. Start in seconds.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/onboarding">
              <Button
                size="lg"
                className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-purple-500/25 transition-all"
              >
                <span>Get Started with YOJNA</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
