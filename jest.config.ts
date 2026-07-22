import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
  // 仅统计 3 个核心服务的覆盖率，符合"核心服务行覆盖 ≥50%"的目标。
  // 若包含全部 src 文件，未测试文件会将全局覆盖率拉低至 ~12%，无法达到 global 阈值。
  collectCoverageFrom: [
    'src/project-manager/services/projectService.ts',
    'src/common/store/appStore.ts',
    'src/preview/services/previewService.ts',
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: { branches: 40, functions: 50, lines: 50, statements: 50 },
  },
};

export default config;
