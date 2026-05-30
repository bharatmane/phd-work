/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        mist: "#dbe7ff",
        aurora: "#67e8f9",
        ember: "#fb7185",
        gold: "#fbbf24",
        slateglass: "rgba(10, 18, 34, 0.72)",
      },
      boxShadow: {
        glow: "0 18px 60px rgba(103, 232, 249, 0.18)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top, rgba(103,232,249,0.18), transparent 28%), radial-gradient(circle at 80% 20%, rgba(251,113,133,0.14), transparent 20%), linear-gradient(180deg, #040916 0%, #08111f 45%, #050913 100%)",
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseLine: {
          "0%": { opacity: "0.35" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.35" },
        },
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "pulse-line": "pulseLine 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
