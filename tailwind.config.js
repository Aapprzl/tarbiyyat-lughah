/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-latin)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        aurora: "aurora 60s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-up": "fadeUp 0.5s ease-out forwards",
        blob: "blob 7s infinite",
        gradient: "gradient 6s ease infinite",
      },
      keyframes: {
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        fadeUp: {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        gradient: {
          "0%, 100%": {
             "background-size": "200% 200%",
             "background-position": "left center"
          },
          "50%": {
             "background-size": "200% 200%",
             "background-position": "right center"
          }
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
