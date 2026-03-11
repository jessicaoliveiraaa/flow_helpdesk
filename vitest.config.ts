import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		environmentMatchGlobs: [['**/*.test.tsx', 'jsdom']],
		setupFiles: ['src/client/test/setup.ts']
	}
})
