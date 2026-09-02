import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const { compilerOptions } = JSON.parse(
  readFileSync(path.resolve(__dirname, 'tsconfig.paths.json'), 'utf-8'),
);

const alias = Object.entries(
  compilerOptions.paths as Record<string, string[]>,
).map(([key, [value]]) => ({
  find: key.replace(/\/\*$/, ''),
  replacement: path.resolve(__dirname, value.replace(/\/\*$/, '')),
}));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');

  return {
    plugins: [react()],
    resolve: { alias },
    define: {
      'process.env': '({})',
      ...Object.fromEntries(
        Object.entries(env).map(([key, value]) => [
          `process.env.${key}`,
          JSON.stringify(value),
        ]),
      ),
    },
    envPrefix: 'REACT_APP_',
    server: { port: 3000, strictPort: true },
    build: { outDir: 'build' },
    css: {
      preprocessorOptions: {
        scss: { silenceDeprecations: ['import'] },
      },
    },
  };
});
