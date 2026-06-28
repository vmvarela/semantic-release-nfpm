# @vmvarela/semantic-release-nfpm

Package binaries into .deb/.rpm/.apk formats via nfpm during semantic-release.

## Usage

```yaml
plugins:
  - '@vmvarela/semantic-release-nfpm':
      config: "packaging/nfpm.yaml"
      formats: ["deb", "rpm"]
      arch_map:
        x86_64-linux-musl:
          deb: amd64
          rpm: x86_64
```

## Config

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `config` | `string` | yes | Path to nfpm YAML config |
| `formats` | `array` | yes | Package formats (`deb`, `rpm`, `apk`) |
| `arch_map` | `object` | yes | Maps build target names to nfpm architecture names |

## Requirements

- nfpm installed (`npm install -g nfpm` or CI installation)
- `semantic-release` ^24
- Node >= 24
