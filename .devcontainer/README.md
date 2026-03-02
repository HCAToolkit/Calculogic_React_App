# Devcontainer Baseline

## Runtime baseline
- Node baseline is defined by the devcontainer image: `mcr.microsoft.com/devcontainers/javascript-node:22`.

## Post-create behavior
`postCreateCommand` installs and runs:
- `ripgrep` (`rg`) via apt (for fast repo search during audits/refactors)
- project dependencies (`npm install`)
- project build (`npm run build`)

## Maintenance
If the devcontainer baseline changes, update `.devcontainer/devcontainer.json` + this file together.
