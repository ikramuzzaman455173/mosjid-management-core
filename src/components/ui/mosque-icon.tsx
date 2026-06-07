import React from "react";
import { cn } from "@/lib/utils";

export function MosqueIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-mosque", className)}
      {...props}
    >
      {/* Ground */}
      <path d="M2 22h20" />
      
      {/* Main Dome */}
      <path d="M7 22v-8c0-4 2-8 5-8s5 4 5 8v8" />
      
      {/* Dome Spire */}
      <path d="M12 6V3" />
      <path d="M12 1.5a1.5 1.5 0 0 1 0 3" />
      
      {/* Left Minaret */}
      <path d="M4 22V8" />
      <path d="M3 10h2" />
      <path d="M4 8l-1 2h2z" />
      
      {/* Right Minaret */}
      <path d="M20 22V8" />
      <path d="M19 10h2" />
      <path d="M20 8l-1 2h2z" />
      
      {/* Door */}
      <path d="M10 22v-4a2 2 0 0 1 4 0v4" />
    </svg>
  );
}
