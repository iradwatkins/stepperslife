"use client";

import React from "react";
import CountUp from "react-countup";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  gradient?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  change,
  gradient = "bg-gradient-primary",
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2,
  className = "",
}: StatsCardProps) {
  const isNumber = typeof value === "number";

  return (
    <div
      className={cn(
        "relative bg-white dark:bg-gray-800 rounded-2xl shadow-soft-xl p-4 transform3d transition-all duration-300 hover:shadow-soft-2xl hover:-translate-y-1",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isNumber ? (
              <>
                {prefix}
                <CountUp
                  end={value}
                  duration={duration}
                  decimals={decimals}
                  separator=","
                />
                {suffix}
              </>
            ) : (
              value
            )}
          </h3>
          {change && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  "text-sm font-semibold",
                  change.type === "increase" ? "text-green-500" : "text-red-500"
                )}
              >
                {change.type === "increase" ? "+" : "-"}{change.value}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl",
            gradient,
            "text-white shadow-soft-md"
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}