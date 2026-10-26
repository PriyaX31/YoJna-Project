"use client";

import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Quote,
  TrendingUp,
  Sparkles,
  Globe2,
  Cpu,
  Layers,
  Zap,
} from "lucide-react";

const companies = [
  {
    name: "Google Cloud",
    domain: "Cloud & AI Infrastructure",
    tag: "Enterprise",
    icon: Globe2,
    accent: "from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30",
    metric: "3.2x faster releases",
    quote:
      "YOJNA transformed how our cross-functional teams manage complex dependencies across distributed cloud microservices.",
    author: "Elena Rostova",
    role: "Staff Engineering Lead",
  },
  {
    name: "Spotify",
    domain: "Audio Streaming",
    tag: "Agile at Scale",
    icon: Zap,
    accent: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30",
    metric: "40% less sprint rollover",
    quote:
      "The squad-level Kanban workflows gave our engineers complete visibility into our weekly release trains without overhead.",
    author: "Marcus Lindqvist",
    role: "Principal Product Director",
  },
  {
    name: "Netflix",
    domain: "Global Streaming",
    tag: "Streaming Media",
    icon: Layers,
    accent: "from-rose-500/20 to-purple-500/10 text-rose-400 border-rose-500/30",
    metric: "99.99% predictability",
    quote:
      "Rapid issue triaging and instant sprint rollouts have drastically minimized deployment roadblocks during peak viewing hours.",
    author: "Priya Sharma",
    role: "VP of Engineering Systems",
  },
  {
    name: "Stripe",
    domain: "Financial Infrastructure",
    tag: "Fintech",
    icon: TrendingUp,
    accent: "from-purple-500/20 to-fuchsia-500/10 text-purple-400 border-purple-500/30",
    metric: "Zero-latency issue triage",
    quote:
      "Fintech reliability demands precision. YOJNA provides the agile discipline and granular tracking our platform engineers need.",
    author: "David Chen",
    role: "Head of Infrastructure",
  },
  {
    name: "Uber",
    domain: "Mobility & Logistics",
    tag: "Logistics",
    icon: Cpu,
    accent: "from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30",
    metric: "500+ squads synced",
    quote:
      "Managing thousands of microservice tickets became effortless once we centralized our sprint cycles and backlog on YOJNA.",
    author: "Sarah Jenkins",
    role: "Director of Technical Programs",
  },
  {
    name: "Airbnb",
    domain: "Travel & Hospitality",
    tag: "Consumer Tech",
    icon: Building2,
    accent: "from-pink-500/20 to-rose-500/10 text-pink-400 border-pink-500/30",
    metric: "2x faster feature iteration",
    quote:
      "From product design to production rollout, YOJNA keeps designers, PMs, and developers in complete, continuous sync.",
    author: "Liam O'Connor",
    role: "Lead Platform Architect",
  },
  {
    name: "Microsoft",
    domain: "Enterprise Software",
    tag: "Developer Tools",
    icon: Sparkles,
    accent: "from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30",
    metric: "10,000+ tickets tracked",
    quote:
      "Enterprise-grade security and intuitive organization workspaces that scaled smoothly across multiple global departments.",
    author: "Rachel Vance",
    role: "Group Engineering Manager",
  },
];

export function CompanyCarousel() {
  const [api, setApi] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [current, setCurrent] = useState(0);

  // Auto-slide carousel smoothly every 3.5 seconds with pause-on-hover
  useEffect(() => {
    if (!api || isHovered) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 3500);

    return () => clearInterval(interval);
  }, [api, isHovered]);

  // Track active slide index
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-900">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <Badge
          variant="outline"
          className="px-3 py-1 text-xs uppercase tracking-wider border-purple-500/30 text-purple-400 mb-4"
        >
          Trusted by Industry Leaders
        </Badge>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100">
          Powering agile squads at world-class companies
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-400">
          See how leading engineering organizations use YOJNA to streamline sprint execution and ship game-changing software faster.
        </p>
      </div>

      {/* Carousel Container */}
      <div
        className="relative px-2 sm:px-12"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {companies.map((company, index) => {
              const Icon = company.icon;
              return (
                <CarouselItem
                  key={index}
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <Card className="h-full bg-slate-900/60 border-slate-800/80 hover:border-purple-500/40 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 rounded-2xl flex flex-col justify-between p-6">
                    <div>
                      {/* Company Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl border bg-gradient-to-br flex items-center justify-center shrink-0 ${company.accent}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-100 text-base leading-tight">
                              {company.name}
                            </h3>
                            <p className="text-xs text-slate-400">
                              {company.domain}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-semibold tracking-wider border-slate-700 bg-slate-800/60 text-slate-300"
                        >
                          {company.tag}
                        </Badge>
                      </div>

                      {/* Metric Callout */}
                      <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-500/20 text-xs font-semibold text-purple-300">
                        <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                        <span>{company.metric}</span>
                      </div>

                      {/* Quote */}
                      <div className="relative">
                        <Quote className="w-4 h-4 text-purple-400/40 absolute -top-1 -left-1 transform -scale-x-100" />
                        <p className="text-slate-300 text-sm leading-relaxed pl-4 italic">
                          &ldquo;{company.quote}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Author Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          {company.author}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {company.role}
                        </div>
                      </div>
                      <span className="text-[10px] text-purple-400/70 font-mono font-medium">
                        Verified Team
                      </span>
                    </div>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* Navigation Arrows */}
          <CarouselPrevious className="hidden sm:flex -left-5 md:-left-6 bg-slate-900/90 border-slate-700 text-slate-200 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors shadow-lg" />
          <CarouselNext className="hidden sm:flex -right-5 md:-right-6 bg-slate-900/90 border-slate-700 text-slate-200 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors shadow-lg" />
        </Carousel>

        {/* Slide Indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-8">
          {companies.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                current === i
                  ? "w-6 bg-purple-500"
                  : "w-1.5 bg-slate-700 hover:bg-slate-500"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
