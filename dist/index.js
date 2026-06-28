import { NfpmConfigSchema, exec } from '@vmvarela/semantic-release-shared';
import { copyFile, chmod } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
export async function verifyConditions(pluginConfig, _context) {
    NfpmConfigSchema.parse(pluginConfig);
}
export async function prepare(pluginConfig, context) {
    const config = NfpmConfigSchema.parse(pluginConfig);
    const { config: nfpmConfig, formats, arch_map } = config;
    const version = context.nextRelease.version;
    const cwd = context.cwd;
    const artifacts = [];
    for (const [targetArch, formatMap] of Object.entries(arch_map)) {
        for (const format of formats) {
            const arch = formatMap[format];
            if (!arch)
                continue;
            context.logger.log(`[nfpm] Packaging ${format}/${arch}...`);
            // Stage source files expected by nfpm.yaml before running nfpm
            if (config.asset_map?.[targetArch]) {
                await copyFile(resolve(cwd, 'dist', config.asset_map[targetArch]), resolve(cwd, 'sql-pipe'));
                await chmod(resolve(cwd, 'sql-pipe'), 0o755);
                // Man page (same for all archs — copy once, idempotent)
                try {
                    await copyFile(resolve(cwd, 'dist', 'sql-pipe.1.gz'), resolve(cwd, 'sql-pipe.1.gz'));
                }
                catch {
                    // Man page not in dist/ — nfpm may skip if optional
                }
            }
            await exec('nfpm', [
                'package', '-p', format,
                '-f', nfpmConfig,
                '-t', 'dist/',
            ], {
                cwd,
                env: { ...process.env, VERSION: version.replace(/^v/, ''), GOARCH: arch },
            });
            const bare_version = version.replace(/^v/, '');
            const ext = format === 'deb' ? 'deb' : format === 'rpm' ? 'rpm' : 'apk';
            const pkgName = config.name ?? (basename(cwd) || 'package');
            artifacts.push({
                path: `dist/${pkgName}_${bare_version}_${arch}.${ext}`,
                name: `${pkgName}_${bare_version}_${arch}.${ext}`,
                type: 'package',
                target: targetArch,
            });
        }
    }
    return { artifacts };
}
//# sourceMappingURL=index.js.map