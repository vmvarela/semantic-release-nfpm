import { NfpmConfigSchema, exec } from '@vmvarela/semantic-release-shared';
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
                type: 'package',
                target: targetArch,
            });
        }
    }
    return { artifacts };
}
//# sourceMappingURL=index.js.map