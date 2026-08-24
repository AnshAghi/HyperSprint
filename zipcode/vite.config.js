import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import pkg from './package.json';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import tailwindcss from '@tailwindcss/vite';
import hdConfig from './hyperdart.config';
import hDBackend from '@hyperdart/backend';

function createDartFramePlugin(hdConfig, pkg) {
  return {
    name: 'vite-plugin-dart-frame',
  };
}

export default defineConfig(({ command }) => {
  const isProduction = command === 'build';
  const { dir: outDir, name: fileName } = path.parse(pkg.module);

  return {
    // base: hdConfig.client.baseURL,
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }),
      tailwindcss(),
      createDartFramePlugin(hdConfig, pkg),
      cssInjectedByJsPlugin(),
      visualizer(),
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
    },
    server: {
      cors: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      proxy: {
        '/nodeapi': {
          target: 'https://dev.hyperdart.com',
          changeOrigin: true,
          secure: true,
        },
        '/c': {
          target: 'https://dev.hyperdart.com',
          changeOrigin: true,
          secure: true,
        },
      },
    },
    build: {
      lib: {
        entry: pkg.source,
        name: pkg.umdName || 'HD' + pkg.name,
        fileName,
        formats: ['es'],
      },
      emptyOutDir: false,
      outDir,
    },
  };
});
