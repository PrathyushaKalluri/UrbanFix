import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(() => {
    const springApiTarget =
        process.env.VITE_SPRING_API_PROXY_TARGET ?? "http://localhost:8000";
    const matchingApiTarget =
        process.env.VITE_MATCHING_API_PROXY_TARGET ?? "http://localhost:8000";

    return {
        plugins: [react()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        server: {
            port: 5173,
            proxy: {
                "/api/auth": {
                    target: springApiTarget,
                    changeOrigin: true,
                },
                "/api/experts/all": {
                    target: springApiTarget,
                    changeOrigin: true,
                },
                "/api/experts/search": {
                    target: matchingApiTarget,
                    changeOrigin: true,
                },
                "/api/matching": {
                    target: matchingApiTarget,
                    changeOrigin: true,
                },
            },
        },
    };
});
