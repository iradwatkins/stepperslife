import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  placeholder?: string;
}

/**
 * Reusable select component with consistent styling
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm",
            "appearance-none cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-gray-900 dark:text-white",
            "transition-colors duration-200",
            error
              ? "border-red-500 focus:ring-red-500 dark:border-red-400"
              : "border-gray-300 focus:ring-purple-500 dark:border-gray-700",
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    );
  }
);

Select.displayName = "Select";

/**
 * Checkbox component with label
 */
export interface CheckboxProps {
  id?: string;
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  id,
  label,
  checked = false,
  onChange,
  disabled = false,
  className,
}: CheckboxProps) {
  const inputId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex items-center cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input
        type="checkbox"
        id={inputId}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        className={cn(
          "w-4 h-4 rounded border-gray-300 text-purple-600",
          "focus:ring-2 focus:ring-purple-500 focus:ring-offset-0",
          "dark:border-gray-600 dark:bg-gray-800",
          "transition-colors duration-200"
        )}
      />
      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
        {label}
      </span>
    </label>
  );
}

/**
 * Radio button component
 */
export interface RadioProps {
  id?: string;
  name: string;
  label: string;
  value: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function Radio({
  id,
  name,
  label,
  value,
  checked = false,
  onChange,
  disabled = false,
  className,
}: RadioProps) {
  const inputId = id || `radio-${name}-${value}`;
  
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex items-center cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input
        type="radio"
        id={inputId}
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange?.(value)}
        disabled={disabled}
        className={cn(
          "w-4 h-4 border-gray-300 text-purple-600",
          "focus:ring-2 focus:ring-purple-500 focus:ring-offset-0",
          "dark:border-gray-600 dark:bg-gray-800",
          "transition-colors duration-200"
        )}
      />
      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
        {label}
      </span>
    </label>
  );
}

/**
 * Switch/Toggle component
 */
export interface SwitchProps {
  id?: string;
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  id,
  label,
  checked = false,
  onChange,
  disabled = false,
  className,
}: SwitchProps) {
  const inputId = id || `switch-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex items-center cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <button
        type="button"
        id={inputId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          checked ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-700"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
      {label && (
        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
    </label>
  );
}