"use client";
import { motion } from "framer-motion";

const skeletonVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.04 * i },
  }),
};

export default function PlayerSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={skeletonVariants}
          className="rounded-xl bg-gray-200 animate-pulse p-4 flex flex-col gap-3 shadow"
        >
          <div className="rounded-full bg-gray-300 h-12 w-12 mx-auto mb-2" />
          <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto" />
          <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto" />
          <div className="h-3 bg-gray-300 rounded w-1/3 mx-auto" />
          <div className="h-2 bg-gray-200 rounded w-full mt-2" />
        </motion.div>
      ))}
    </>
  );
}