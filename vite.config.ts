/// <reference types="vitest/config" />
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
  const env = loadEnv(mode, path.resolve(__dirname), 'REACT_APP_');

  return {
    plugins: [react()],
    resolve: { alias },
    define: {
      'process.env': 'import.meta.env',
      ...Object.fromEntries(
        Object.entries(env).map(([key, value]) => [
          `process.env.${key}`,
          JSON.stringify(value),
        ]),
      ),
    },
    envPrefix: 'REACT_APP_',
    server: { port: 3000, strictPort: true },
    preview: { port: 3000, strictPort: true },
    build: { outDir: 'build' },
    css: {
      preprocessorOptions: {
        scss: { silenceDeprecations: ['import'] },
      },
    },
    test: {
      // 날짜 변환 테스트가 실행 환경(CI의 UTC 등)과 무관하게 KST 기준으로 돌게 한다.
      // npm 스크립트의 `TZ=... vitest`는 Windows cmd에서 동작하지 않아 설정으로 지정한다
      env: { TZ: 'Asia/Seoul' },
    },
  };
});
