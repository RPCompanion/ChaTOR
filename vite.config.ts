import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import routify from "@roxi/routify/vite-plugin";
import sveltePreprocess from "svelte-preprocess";
import wasm from 'vite-plugin-wasm';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        wasm(),
        svelte({
            preprocess: sveltePreprocess({ postcss: true }),
        }),
        routify(),
    ],
    build: {
        target: "esnext"
    },
    test: {
        environment: "jsdom",
    },
});
