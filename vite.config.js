import { defineConfig } from 'vite';
import glob from 'glob';
import injectHTML from 'vite-plugin-html-inject';
import FullReload from 'vite-plugin-full-reload';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { globalStylesOptions } from './global.styles';

import { resolve } from 'path';
import { createHtmlPlugin } from 'vite-plugin-html'

const htmlFiles = glob.sync('./src/*.html');
const input = htmlFiles.reduce((entries, file) => {
  const name = file.match(/\/([^\/]+)\.html$/)[1];
  entries[name] = resolve(__dirname, file);
  return entries;
}, {});

export default defineConfig(() => {
  return {
    base: '/legaltefu/',
    root: 'src',
    build: {
      assetsInlineLimit: 0,
      cssCodeSplit: false,
      outDir: '../dist',
      sourcemap: false,
      rollupOptions: {
        input,
        output: {
     
          assetFileNames: (assetInfo) => {
            if (/\.(css)$/i.test(assetInfo.name)) {
              return 'styles/styles.css';
            }
            if (/\.(css\.map)$/i.test(assetInfo.name)) {
              return 'styles/styles.css.map';  
            }
            if (/\.map$/i.test(assetInfo.name)) {
              return 'js/[name][extname]';
            }
            if (/\.(png|jpe?g|gif|webp|svg)$/i.test(assetInfo.name)) {
              return 'img/[name][extname]';
            }
            return 'assets/[name][extname]';
          },
          entryFileNames: 'js/[name].js',
          chunkFileNames: 'js/[name].js',
        },
      },
    },
    plugins: [
      injectHTML(),
      FullReload(['./src/**/*.html']),
      createHtmlPlugin({
        inject: {
          injectData: {},
        },
        minify: true,
      }),
      

      ViteImageOptimizer({
        png: { quality: 60 },
        jpeg: { quality: 60 },
        jpg: { quality: 60 },
        webp: { quality: 60 },
        svg: {
          multipass: true,
          plugins: [
            { name: 'removeDimensions', active: true },
            { name: 'removeViewBox', active: false },
          ],
        },
      }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: globalStylesOptions,
        },
      },
    },
  };
});
