import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm placeholder:text-gray-400 shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300 focus-visible:border-red-400 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
