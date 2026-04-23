import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(() => {
    const springApiTarget =
        process.env.VITE_SPRING_API_PROXY_TARGET ?? "http://localhost:8080";

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
                "/api": {
                    target: springApiTarget,
                    changeOrigin: true,
                },
                "/ws": {
                    target: springApiTarget,
                    changeOrigin: true,
                    ws: true,
                },
            },
        },
    };
});
