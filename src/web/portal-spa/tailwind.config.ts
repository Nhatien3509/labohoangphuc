import type { CSSRuleObject, PluginAPI } from "tailwindcss/types/config";
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    screens: {
      xs: "414px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1366px",
      "2xl": "1440px",
      "3xl": "1920px",
      "4k": "3840px",
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        border: "var(--neutral-100)",
        input: "var(--neutral-100)",
        ring: "var(--neutral-900)",
        background: "var(--neutral-0)",
        foreground: "var(--neutral-800)",
        primary: {
          DEFAULT: "",
          foreground: "",
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
        },
        secondary: {
          DEFAULT: "var(--neutral-100)",
          foreground: "",
        },
        destructive: {
          DEFAULT: "var(--primary-200)",
          foreground: "var(--neutral-50)",
        },
        muted: {
          DEFAULT: "var(--neutral-100)",
          foreground: "",
        },
        accent: {
          DEFAULT: "var(--neutral-100)",
          foreground: "",
        },
        popover: {
          DEFAULT: "var(--neutral-0)",
          foreground: "var(--neutral-800)",
        },
        card: {
          DEFAULT: "var(--neutral-0)",
          foreground: "var(--neutral-800)",
        },

        neutral: {
          0: "var(--neutral-0)",
          50: "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          300: "var(--neutral-300)",
          400: "var(--neutral-400)",
          500: "var(--neutral-500)",
          600: "var(--neutral-600)",
          700: "var(--neutral-700)",
          800: "var(--neutral-800)",
          900: "var(--neutral-900)",

          "dark-0": "var(--neutral-dark-0)",
          "dark-50": "var(--neutral-dark-50)",
          "dark-100": "var(--neutral-dark-100)",
          "dark-200": "var(--neutral-dark-200)",
          "dark-300": "var(--neutral-dark-300)",
          "dark-400": "var(--neutral-dark-400)",
          "dark-500": "var(--neutral-dark-500)",
          "dark-600": "var(--neutral-dark-600)",
          "dark-700": "var(--neutral-dark-700)",
          "dark-800": "var(--neutral-dark-800)",
          "dark-900": "var(--neutral-dark-900)",

          bg: "var(--neutral-bg)",
          "dark-bg": "var(--neutral-dark-bg)",
        },

        red: {
          50: "var(--red-50)",
          100: "var(--red-100)",
          200: "var(--red-200)",
          300: "var(--red-300)",
          400: "var(--red-400)",
          500: "var(--red-500)",
          600: "var(--red-600)",
          700: "var(--red-700)",
          800: "var(--red-800)",
          900: "var(--red-900)",
        },

        blue: {
          50: "var(--blue-50)",
          100: "var(--blue-100)",
          200: "var(--blue-200)",
          300: "var(--blue-300)",
          400: "var(--blue-400)",
          500: "var(--blue-500)",
          600: "var(--blue-600)",
          700: "var(--blue-700)",
          800: "var(--blue-800)",
          900: "var(--blue-900)",
        },

        green: {
          50: "var(--green-50)",
          100: "var(--green-100)",
          200: "var(--green-200)",
          300: "var(--green-300)",
          400: "var(--green-400)",
          500: "var(--green-500)",
          600: "var(--green-600)",
          700: "var(--green-700)",
          800: "var(--green-800)",
          900: "var(--green-900)",
        },

        orange: {
          50: "var(--orange-50)",
          100: "var(--orange-100)",
          200: "var(--orange-200)",
          300: "var(--orange-300)",
          400: "var(--orange-400)",
          500: "var(--orange-500)",
          600: "var(--orange-600)",
          700: "var(--orange-700)",
          800: "var(--orange-800)",
          900: "var(--orange-900)",
        },
      },

      boxShadow: {
        "D-X0-Y2-B4-S0-15": "var(--D-X0-Y2-B4-S0-15)",
        "D-X0-Y2-B4-S0-25": "var(--D-X0-Y2-B4-S0-25)",
        "D-X0-Y4-B6-S0-25": "var(--D-X0-Y4-B6-S0-25)",
        "D-X0-Y0-B10-S0-30": "var(--D-X0-Y0-B10-S0-30)",
        "D-X0-Y2-B2-S0-30": "var(--D-X0-Y2-B2-S0-30)",
        "D-X-2-Y4-B10-S0-60": "var(--D-X-2-Y4-B10-S0-60)",
        "D-X0-Y0-B6-S0-30": "var(--D-X0-Y0-B6-S0-30)",
        "D-X0-Y0-B6-S0-Neutral-50": "var(--D-X0-Y0-B6-S0-Neutral-50)",
        "D-X0-Y2-B8-S0-15": "var(--D-X0-Y2-B8-S0-15)",
        "D-X0-Y2-B8-S0-10": "var(--D-X0-Y2-B8-S0-10)",
        "D-X0-Y1-B2-S0-30": "var(--D-X0-Y1-B2-S0-30)",
        "D-X0-Y0-B8-S0-15": "var(--D-X0-Y0-B8-S0-15)",
        "D-X1-Y2-B8-S0-45": "var(--D-X1-Y2-B8-S0-45)",
        "D-X0-Y-1-B20-S0-20": "var(--D-X0-Y-1-B20-S0-20)",
        "D-X0-Y2-B4-s0-25": "var(--D-X0-Y2-B4-S0-25)",
        "D-X0-Y0-B4-S0-100": "var(--D-X0-Y0-B4-S0-100)",
        "D-X0-Y0-B10-S0-100": "var(--D-X0-Y0-B10-S0-100)",
        "D-X3-Y0-B2-S0-30": "var(--D-X3-Y0-B2-S0-30)",

        "I-X0-Y0-B6-S0-25": "var(--I-X0-Y0-B6-S0-25)",
        "I-X0-Y0-B6-S0-30": "var(--I-X0-Y0-B6-S0-30)",
        "I-X1-Y1-B2-S0-Neutral-0": "var(--I-X1-Y1-B2-S0-Neutral-0)",
        "I-X0-Y1-B4-S0-60": "var(--I-X0-Y1-B4-S0-60)",
        "I-X0-Y-1-B0-S0-15": "var(--I-X0-Y-1-B0-S0-15)",
        "I-X2-Y2-B4-S0-25": "var(--I-X2-Y2-B4-S0-25)",
        "I-X0-Y1-B4-S0-30": "var(--I-X0-Y1-B4-S0-30)",
        "I-X0-Y0-B4-S0-25": "var(--I-X0-Y0-B4-S0-25)",
        "I-X0-Y4-B4-S0-25": "var(--I-X0-Y4-B4-S0-25)",
        "I-X0-Y0-B4-S2-30": "var(--I-X0-Y0-B4-S2-30)",
      },

      fontSize: {
        base: ["var(--font-size)", "var(--line-height)"], // 14px, 20px
        md: ["calc(var(--font-size) + 2px)", "calc(var(--line-height) + 4px)"], // 16px, 24px
        lg: ["calc(var(--font-size) + 4px)", "calc(var(--line-height) + 8px)"], // 18px, 28px
        xl: ["calc(var(--font-size) + 6px)", "calc(var(--line-height) + 12px)"], // 20px, 32px
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "fade-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.95)" },
        },
        move: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        navigating: {
          "0%": { transform: "translateX(-120%)" },
          "60%": { transform: "translateX(140%)" },
          "100%": { transform: "translateX(180%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        loadingWave: {
          "0%, 100%": { opacity: "0.25", filter: "brightness(0.95)" },
          "40%": { opacity: "1", filter: "brightness(1.2)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        move: "move 8s linear infinite ",
        shimmer: "shimmer 3s infinite linear",
        "loading-wave": "loadingWave 900ms ease-in-out infinite",
        navigating: "navigating 2s ease-in-out infinite",
      },
      backgroundImage: {
        "shimmer-gradient":
          "linear-gradient(90deg, #e0e0e0 0%, #f5f5f5 50%, #e0e0e0 100%)",
      },
      screens: {
        "4xl": "1654px",
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("tailwindcss-animate"),
    plugin(function (pluginAPI: PluginAPI) {
      pluginAPI.addVariant("firefox", "@-moz-document url-prefix()");
    }),
    plugin(
      ({
        addComponents,
        addUtilities,
      }: {
        addComponents: (
          components: CSSRuleObject | CSSRuleObject[],
          options?: Partial<{
            respectPrefix: boolean;
            respectImportant: boolean;
          }>,
        ) => void;
        addUtilities: (
          components: CSSRuleObject | CSSRuleObject[],
          options?: Partial<{
            respectPrefix: boolean;
            respectImportant: boolean;
          }>,
        ) => void;
      }) => {
        addComponents({
          ".focus-visible": {
            "&:focus-visible": {
              "--tw-ring-color": "var(--primary-200)",
              "--tw-ring-offset-shadow":
                "var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)",
              "--tw-ring-shadow":
                "var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color)",
              boxShadow:
                "var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000)",
            },
          },
          ".text-button": {
            "background-color": "var(--primary-100) !important",
            color: "transparent !important",
            "-webkit-background-clip": "text ",
            " -webkit-text-fill-color": "transparent !important",
            " -moz-background-clip": "text !important",
            " background-clip": "text !important",
            "&:active": {
              backgroundColor: "var(--primary-200)",
              textShadow: "0px 0px 4px rgba(255, 255, 255, 0.3)",
              color: "transparent",
            },
            "&:hover": {
              backgroundColor: "var(--primary-200)",
              color: "transparent",
            },
            "&:focus-visible": {
              "border-width": "1px",
              "border-color": "var(--primary-50)",
              color: "var(--primary-100) !important",
            },
          },

          ".scrollbar::-webkit-scrollbar": {
            height: "0.375rem",
            width: "0.375rem",
          },
          ".scrollbar::-webkit-scrollbar-track": {
            background: "#e1e1e1",
            borderRadius: "0.75rem",
          },
          ".scrollbar::-webkit-scrollbar-thumb": {
            backgroundColor: "var(--neutral-200)",
            borderRadius: "0.75rem",
            transition: "background-color 150ms ease",
          },
          ".scrollbar::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "var(--neutral-300)",
          },

          ".scrollbar-none::-webkit-scrollbar": {
            height: "0px",
            width: "0px",
          },
          ".scrollbar-none::-webkit-scrollbar-track": {
            background: "#e1e1e1",
            borderRadius: "0.75rem",
          },
          ".scrollbar-none::-webkit-scrollbar-thumb": {
            backgroundColor: "var(--neutral-300)",
            borderRadius: "0.75rem",
          },
        });
        addUtilities({
          ".base-transition": {
            "transition-property": "all",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
            "transition-duration": "150ms",
            "animation-duration": "150ms",
            "animation-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
          },
          ".dropdown-content-width-full": {
            width: "var(--radix-dropdown-menu-trigger-width)",
          },
        });
      },
    ),
  ],
} satisfies Config;

export default config;
