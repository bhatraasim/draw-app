"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StudioButton } from "./StudioButton";
import { StudioInput } from "./StudioInput";
import { GlassPanel } from "./GlassPanel";
import { Sparkles, Zap, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../conif";

interface AuthPageProps {
  initialMode?: "signin" | "signup";
}

export function AuthPage({ initialMode = "signin" }: AuthPageProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        mode === "signin" ? `${BACKEND_URL}/signin` : `${BACKEND_URL}/signup`;
      const payload =
        mode === "signin" ? { email, password } : { email, password, name };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "An error occurred. Please try again.");
        return;
      }

      // For signin, store the token
      if (mode === "signin" && data.token) {
        localStorage.setItem("token", data.token);
      }

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Auth error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: <Sparkles className="w-5 h-5" />, text: "Unlimited canvases" },
    { icon: <Zap className="w-5 h-5" />, text: "Real-time collaboration" },
    { icon: <Shield className="w-5 h-5" />, text: "Secure and private" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Story */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-[45%] bg-linear-to-br from-accent/10 via-accent/5 to-transparent p-12 flex-col justify-between relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 600">
            <motion.circle
              cx="100"
              cy="100"
              r="80"
              stroke="#3050FF"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <motion.rect
              x="250"
              y="200"
              width="120"
              height="120"
              stroke="#1A1A1B"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2,
                delay: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </svg>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-5xl text-ink mb-4">Studio Canvas</h1>
          <p className="font-ui text-xl text-ink/70">Where ideas take shape</p>
        </div>

        <div className="relative z-10 space-y-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                {benefit.icon}
              </div>
              <span className="font-ui text-lg text-ink">{benefit.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <GlassPanel animate={false} className="p-8 md:p-10">
            {/* Toggle between Sign In and Sign Up */}
            <div className="flex gap-2 mb-8 p-1 bg-muted/30 rounded-lg">
              <button
                onClick={() => setMode("signin")}
                className={`flex-1 py-2 px-4 rounded-md font-ui transition-all duration-200 ${
                  mode === "signin"
                    ? "bg-accent text-white"
                    : "text-ink hover:bg-muted/50"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 py-2 px-4 rounded-md font-ui transition-all duration-200 ${
                  mode === "signup"
                    ? "bg-accent text-white"
                    : "text-ink hover:bg-muted/50"
                }`}
              >
                Sign Up
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: mode === "signin" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "signin" ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <h2 className="font-display text-3xl text-ink mb-6">
                  {mode === "signin" ? "Welcome back" : "Create account"}
                </h2>

                {error && (
                  <div className="p-3 bg-danger/10 text-danger rounded-lg text-sm font-ui animate-shake">
                    {error}
                  </div>
                )}

                {mode === "signup" && (
                  <StudioInput
                    label="Name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setName(e.target.value)
                    }
                    required
                  />
                )}

                <StudioInput
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  required
                />

                <StudioInput
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  showPasswordToggle
                  required
                />

                {mode === "signin" && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-muted accent-accent"
                      />
                      <span className="font-ui text-ink/70">Remember me</span>
                    </label>
                    <a href="#" className="font-ui text-accent hover:underline">
                      Forgot password?
                    </a>
                  </div>
                )}

                <StudioButton
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading
                    ? "Please wait..."
                    : mode === "signin"
                      ? "Sign In"
                      : "Create Account"}
                </StudioButton>

                {mode === "signup" && (
                  <p className="text-sm text-ink/60 font-ui text-center">
                    By signing up, you agree to our Terms of Service and Privacy
                    Policy
                  </p>
                )}
              </motion.form>
            </AnimatePresence>
          </GlassPanel>

          {/* Mobile benefits */}
          <div className="lg:hidden mt-8 space-y-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.text}
                className="flex items-center gap-3 text-ink/70"
              >
                <div className="text-accent">{benefit.icon}</div>
                <span className="font-ui text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
