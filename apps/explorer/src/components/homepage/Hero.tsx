"use client";

import React from "react";
import { motion } from "framer-motion";
import StatsCard from "./StatsCard";

export default function Hero() {
  return (
    <section className="w-full py-12 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12 ">
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0.1, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <StatsCard />
          </motion.div>
          <motion.div
            className="flex flex-col justify-center space-y-4"
            initial={{ opacity: 0.1, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
              Fund What Matters
            </h1>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
              Fund What Matters
            </h1>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
              Fund What Matters
            </h1>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
