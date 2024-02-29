import type { Config } from "tailwindcss";
import tailwindForms from "@tailwindcss/forms";
import headlessui from "@headlessui/tailwindcss";

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        "mcc-brand": {
          50: "#eef4ff",
          100: "#e0eaff",
          200: "#c7d7fe",
          300: "#a5bdfc",
          400: "#8198f8",
          500: "#6475f0",
          600: "#474de4",
          700: "#393dc9",
          800: "#3034a3",
          900: "#2d327d",
          950: "#1b1d4b"
        }
      },
      animation: {
        "spin-slow": "spin 3s linear infinite"
      }
    }
  },
  plugins: [
    tailwindForms,
    headlessui
  ]
};
