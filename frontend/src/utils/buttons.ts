export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "warning" | "success" | "link";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export const ButtonVariantClasses: Record<ButtonVariant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600",
  secondary: "bg-gray-600 text-white hover:bg-gray-500 focus-visible:outline-gray-600",
  outline: "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
  danger: "bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600",
  warning: "bg-yellow-600 text-white hover:bg-yellow-500 focus-visible:outline-yellow-600",
  success: "bg-green-600 text-white hover:bg-green-500 focus-visible:outline-green-600",
  link: "bg-transparent text-indigo-500 hover:text-indigo-400 focus-visible:outline-indigo-600 underline shadow-none"
};

export const ButtonSizeClasses: Record<ButtonSize, string> = {
  xs: "px-2 py-1 text-xs rounded",
  sm: "px-2.5 py-1.5 text-sm rounded",
  md: "px-3 py-2 text-sm rounded-md",
  lg: "px-3.5 py-2.5 text-sm rounded-md"
};
