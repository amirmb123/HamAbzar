/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#E8F5EF",
          100: "#C5DAD0",
          500: "#228A5F",
          600: "#1A6B4A",
          700: "#0F4F36",
        },
        danger: {
          50: "#FEF0EE",
          600: "#C0341D",
        },
        warning: {
          50: "#FFF8E7",
          600: "#9A6A00",
        },
        info: {
          50: "#EAF1FB",
          600: "#1A4A8B",
        },
        amber: {
          500: "#F0A500",
        },
        gray: {
          300: "#D1D5DB",
        },
      },
      fontFamily: {
        sans: ["Vazirmatn", "sans-serif"],
      },
      fontSize: {
        xs: "11px",
        sm: "12px",
        base: "13px",
        md: "14px",
        lg: "15px",
        xl: "18px",
        "2xl": "22px",
        "3xl": "28px",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0,0,0,.08)",
        md: "0 4px 12px rgba(0,0,0,.10)",
        lg: "0 8px 24px rgba(0,0,0,.14)",
        pin: "0 2px 8px rgba(0,0,0,.14)",
      },
      spacing: {
        13: "52px",
      },
    },
  },
  plugins: [],
};
