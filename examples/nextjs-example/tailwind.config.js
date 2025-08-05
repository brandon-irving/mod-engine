/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "rarity-common": "#8D8D8D",
        "rarity-rare": "#3B82F6",
        "rarity-epic": "#8B5CF6",
        "rarity-legendary": "#F59E0B",
      },
    },
  },
  plugins: [],
};
