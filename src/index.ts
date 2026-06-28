import { NfpmConfigSchema, exec } from '@vmvarela/semantic-release-shared';
import type { NfpmConfig, PluginContext, PrepareResult } from '@vmvarela/semantic-release-shared';

export async function verifyConditions(
  pluginConfig: unknown,
  _context: PluginContext,
): Promise<void> {
  NfpmConfigSchema.parse(pluginConfig);
}

export async function prepare(
  pluginConfig: unknown,
  context: PluginContext,
): Promise<PrepareResult> {
  const config = NfpmConfigSchema.parse(pluginConfig) as NfpmConfig;
  const { config: nfpmConfig, formats, arch_map } = config;
  const version = context.nextRelease.version;
  const cwd = context.cwd;

  const artifacts = [];

  for (const [targetArch, formatMap] of Object.entries(arch_map)) {
    for (const format of formats) {
      const arch = formatMap[format];
      if (!arch) continue;

      context.logger.log(`[nfpm] Packaging ${format}/${arch}...`);

      await exec('nfpm', [
        'package', '-p', format,
        '-f', nfpmConfig,
        '-t', 'dist/',
      ], {
        cwd,
        env: { ...process.env, VERSION: version.replace(/^v/, ''), GOARCH: arch },
      });

      const ext = format === 'deb' ? 'deb' : format === 'rpm' ? 'rpm' : 'apk';
      artifacts.push({
        path: `dist/package_${version.replace(/^v/, '')}_${arch}.${ext}`,
        name: `package_${version.replace(/^v/, '')}_${arch}.${ext}`,
        type: 'package' as const,
        target: targetArch,
      });
    }
  }

  return { artifacts };
}
