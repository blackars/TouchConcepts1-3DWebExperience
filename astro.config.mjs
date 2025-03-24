// @ts-check
import { defineConfig } from 'astro/config';
import solidJs from '@astrojs/solid-js';


// https://astro.build/config
export default defineConfig({
    base: '/touchconcepts1/', // Subdirectorio del proyecto
    integrations: [solidJs()]
});