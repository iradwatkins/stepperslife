import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Info, AlertCircle } from "lucide-react";

interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  warning?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Reusable form field wrapper with consistent styling
 * Handles labels, errors, warnings, and hints
 */
export function FormField({
  label,
  name,
  required = false,
  error,
  warning,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {children}
      </div>
      
      {error && (
        <div className="flex items-start gap-1.5 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {warning && !error && (
        <div className="flex items-start gap-1.5 text-yellow-600 dark:text-yellow-400">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{warning}</span>
        </div>
      )}
      
      {hint && !error && !warning && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * Form section component for grouping related fields
 */
interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ 
  title, 
  description, 
  children, 
  className 
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}