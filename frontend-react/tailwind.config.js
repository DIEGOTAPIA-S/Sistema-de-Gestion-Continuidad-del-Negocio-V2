/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#0f172a", // Slate 900
                secondary: "#3b82f6", // Blue 500
                accent: "#06b6d4", // Cyan 500
                highlight: "#f59e0b", // Amber 500
                danger: "#ef4444", // Red 500
                success: "#10b981", // Emerald 500
                "bg-body": "#f1f5f9", // Slate 100
                "bg-card": "#ffffff",
                "bg-glass": "rgba(255, 255, 255, 0.85)",
                "text-main": "#1e293b", // Slate 800
                "text-muted": "#64748b", // Slate 500
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '12px',
            }
        },
    },
    plugins: [],
}
