import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

/**
 * Reusable input component with consistent styling
 * Supports icons, error states, and all native input props
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, icon, endIcon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500",
            "transition-colors duration-200",
            error
              ? "border-red-500 focus:ring-red-500 dark:border-red-400"
              : "border-gray-300 focus:ring-purple-500 dark:border-gray-700",
            icon && "pl-10",
            endIcon && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        
        {endIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {endIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

/**
 * Textarea component with consistent styling
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm",
          "placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500",
          "transition-colors duration-200 resize-y",
          error
            ? "border-red-500 focus:ring-red-500 dark:border-red-400"
            : "border-gray-300 focus:ring-purple-500 dark:border-gray-700",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

/**
 * Number input with increment/decrement buttons
 */
export interface NumberInputProps extends Omit<InputProps, 'type'> {
  min?: number;
  max?: number;
  step?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, min, max, step = 1, onIncrement, onDecrement, ...props }, ref) => {
    return (
      <div className="relative">
        <Input
          ref={ref}
          type="number"
          min={min}
          max={max}
          step={step}
          className={cn("pr-20", className)}
          {...props}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex">
          <button
            type="button"
            onClick={onDecrement}
            className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l dark:text-gray-400 dark:hover:bg-gray-800"
          >
            −
          </button>
          <div className="w-px bg-gray-300 dark:bg-gray-700" />
          <button
            type="button"
            onClick={onIncrement}
            className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r dark:text-gray-400 dark:hover:bg-gray-800"
          >
            +
          </button>
        </div>
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";