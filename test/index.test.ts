import { describe, it, expect } from 'vitest';
import { verifyConditions } from '../src/index.js';
import type { PluginContext } from '@vmvarela/semantic-release-shared';

const validConfig = {
  config: 'packaging/nfpm.yaml',
  formats: ['deb', 'rpm'],
  arch_map: {
    'x86_64-linux-musl': { deb: 'amd64', rpm: 'x86_64' },
    'aarch64-linux-musl': { deb: 'arm64', rpm: 'aarch64' },
  },
};

const context: PluginContext = {
  logger: { log: () => {}, error: () => {} },
  nextRelease: { version: '1.0.0' },
  branch: { name: 'main' },
  repositoryUrl: 'https://github.com/vmvarela/my-cli',
  env: {},
  cwd: '/tmp/test',
};

describe('nfpm', () => {
  describe('verifyConditions', () => {
    it('passes valid config', async () => {
      await expect(verifyConditions(validConfig, context)).resolves.toBeUndefined();
    });

    it('rejects empty formats', async () => {
      await expect(
        verifyConditions({ ...validConfig, formats: [] }, context),
      ).rejects.toThrow();
    });

    it('rejects invalid format', async () => {
      await expect(
        verifyConditions({ ...validConfig, formats: ['exe'] }, context),
      ).rejects.toThrow();
    });

    it('passes empty arch_map (validation at prepare time)', async () => {
      await expect(
        verifyConditions({ ...validConfig, arch_map: {} }, context),
      ).resolves.toBeUndefined();
    });
  });

  // prepare tests require nfpm + nfpm.yaml — run in CI only
});
