"use client";

import { motion } from "motion/react";
import { StudioButton } from "./components/StudioButton";
import { GlassPanel } from "./components/GlassPanel";
import { Pencil, Users, Zap, Square, Circle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <Pencil className="w-8 h-8" />,
      title: "Intuitive Drawing",
      description:
        "Sketch ideas with precision tools that feel natural and responsive",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Real-time Collaboration",
      description:
        "See cursors move and edits happen live as your team works together",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description:
        "Optimized performance that keeps up with your creative flow",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-surface">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-accent/5 via-transparent to-transparent pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-24 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto text-center"
        >
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl mb-6 text-ink">
            Think clearer,
            <br />
            draw faster
          </h1>
          <p className="font-ui text-xl md:text-2xl text-ink/70 mb-12 max-w-2xl mx-auto">
            A digital canvas that feels like paper, designed for teams who
            sketch their way to solutions
          </p>
          <div className="flex gap-4 justify-center">
            <StudioButton onClick={() => router.push("/dashboard")}>
              Get Started <ArrowRight className="inline ml-2" size={20} />
            </StudioButton>
            <StudioButton
              variant="secondary"
              onClick={() => router.push("/signin")}
            >
              Sign In
            </StudioButton>
          </div>
        </motion.div>

        {/* Layered Mock-up */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-5xl mx-auto mt-20 relative"
        >
          {/* Layer 1: Canvas Background */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 relative min-h-[400px] overflow-hidden">
            {/* Drawing elements */}
            <svg
              className="w-full h-full absolute inset-0"
              viewBox="0 0 800 400"
              preserveAspectRatio="xMidYMid slice"
            >
              <motion.rect
                x="100"
                y="80"
                width="200"
                height="120"
                fill="none"
                stroke="#1A1A1B"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.6 }}
              />
              <motion.circle
                cx="500"
                cy="140"
                r="60"
                fill="none"
                stroke="#3050FF"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.8 }}
              />
              <motion.path
                d="M 320 140 L 420 140"
                stroke="#1A1A1B"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 1 }}
              />
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#1A1A1B" />
                </marker>
              </defs>
            </svg>

            {/* Layer 2: Floating UI Panels */}
            <GlassPanel className="absolute top-8 left-8 p-4 flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors cursor-pointer">
                <Pencil className="w-5 h-5 text-accent" />
              </div>
              <div className="w-10 h-10 rounded-lg hover:bg-ink/5 flex items-center justify-center transition-colors cursor-pointer">
                <Square className="w-5 h-5 text-ink" />
              </div>
              <div className="w-10 h-10 rounded-lg hover:bg-ink/5 flex items-center justify-center transition-colors cursor-pointer">
                <Circle className="w-5 h-5 text-ink" />
              </div>
            </GlassPanel>

            {/* Layer 3: Cursors */}
            <motion.div
              className="absolute"
              animate={{
                x: [100, 200, 300],
                y: [100, 150, 80],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
                  fill="#3050FF"
                  stroke="white"
                  strokeWidth="1"
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GlassPanel className="p-8 hover-lift cursor-pointer h-full">
                  <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center mb-4 text-accent">
                    {feature.icon}
                  </div>
                  <h3 className="font-ui text-xl mb-3 text-ink font-semibold">
                    {feature.title}
                  </h3>
                  <p className="font-ui text-ink/70">{feature.description}</p>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="relative z-10 px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <GlassPanel className="p-12 text-center">
            <h2 className="font-display text-4xl mb-4 text-ink">
              Ready to sketch?
            </h2>
            <p className="font-ui text-lg text-ink/70 mb-8">
              Join teams using Studio Canvas to bring ideas to life
            </p>
            <StudioButton onClick={() => router.push("/signup")}>
              Start Drawing Now
            </StudioButton>
          </GlassPanel>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-muted/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-ink">
              Studio Canvas
            </span>
          </div>
          <p className="font-ui text-sm text-ink/50">
            Built with care for creators everywhere
          </p>
        </div>
      </footer>
    </div>
  );
}
