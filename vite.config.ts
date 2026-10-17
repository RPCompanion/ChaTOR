import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";

export default defineConfig({
    plugins: [
        wasm(),
        react(),
    ],
    build: {
        target: "esnext",
        outDir: "dist/client"
    },
    test: {
        environment: "jsdom",
    },
});
