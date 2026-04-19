'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { ArrowRight, Upload, Brain, MessageCircle, Sparkles, Home, User } from "lucide-react";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";

import { FloatingNav } from "@/components/ui/floating-navbar";

export default function HomePage() {
  const { user, signInWithGoogle, loading } = useAuth();

  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <Home className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Dashboard",
      link: "/dashboard",
      icon: <User className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Contact",
      link: "/contact",
      icon: <MessageCircle className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
  ];

  const features = [
    {
      title: "Upload Image",
      description: "Take a photo or upload an image of any dish from your device. Our advanced AI analyzes the visual data instantly.",
      icon: <Upload className="h-6 w-6" />,
    },
    {
      title: "AI Analysis",
      description: "Our deep learning models identify ingredients and cooking methods to generate a complete, step-by-step recipe.",
      icon: <Brain className="h-6 w-6" />,
    },
    {
      title: "Ask Questions",
      description: "Chat with our AI chef about substitutions, tips, and cooking techniques. It's like having a pro chef in your kitchen.",
      icon: <MessageCircle className="h-6 w-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 overflow-hidden relative">
      <Navbar />
      <FloatingNav navItems={navItems} />

      <div className="min-h-screen w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
        <BackgroundBeams className="absolute top-0 left-0 w-full h-full z-0" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 pt-20">

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0.0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="relative flex flex-col gap-4 items-center justify-center text-center max-w-4xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4 shadow-lg z-20">
              <Sparkles className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Powered by Advanced AI
              </span>
            </div>

            <TypewriterEffect
              words={[
                { text: "Dishcovery", className: "text-4xl md:text-7xl font-bold dark:text-white text-zinc-800" },
              ]}
              className="mb-4"
              cursorClassName="bg-orange-500"
            />

            <div className="font-light text-xl md:text-4xl dark:text-neutral-200 py-2 z-20">
              AI-Powered Recipe Generation
            </div>

            <TextGenerateEffect
              words="Upload a photo of any dish and get instant recipes with ingredients and step-by-step instructions."
              className="text-center max-w-2xl mx-auto mb-8 text-zinc-600 dark:text-zinc-300 text-lg md:text-xl z-20"
            />

            {user ? (
              <Link href="/dashboard" className="z-20">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 shadow-lg hover:shadow-xl hover:from-orange-700 hover:to-amber-700"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={signInWithGoogle}
                disabled={loading}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-black dark:bg-white dark:text-black rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-lg hover:shadow-xl z-20"
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Get Started with Google
              </motion.button>
            )}
          </motion.div>

          {/* Features Section - Now integrated into the flow */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="w-full max-w-6xl mx-auto pb-12"
          >
            <HoverEffect items={features} />
          </motion.div>

        </div>
      </div>
    </div>
  );
}
