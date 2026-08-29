# Devcontainer Baseline

## Runtime baseline

- Node baseline is defined by the devcontainer image: `mcr.microsoft.com/devcontainers/javascript-node:22`.

## Post-create behavior

`postCreateCommand` installs and runs:

- `ripgrep` (`rg`) via apt (for fast repo search during audits/refactors)
- project dependencies (`npm install`)
- project build (`npm run build`)
- `.devcontainer/ensure-standalone-validator-checkout.sh`

The checkout helper ensures the standalone validator repository is available beside the React app checkout:

```text
/workspaces/
├─ Calculogic_React_App/
└─ calculogic-validator/
```

If the standalone validator checkout already exists, the helper leaves it in place. The helper does not fetch, reset, overwrite, or automatically link an existing checkout.

## Validator live-development mode

The shared Codespace checkout does **not** automatically enable `npm link`. Stable package consumption and live development remain separate, explicit modes.

When live validator development is wanted, link the standalone checkout deliberately:

```bash
cd ../calculogic-validator
npm link

cd ../Calculogic_React_App
npm link @calculogic/validator
```

With that link active, validator source edits are made in the standalone `calculogic-validator` Git checkout while commands launched from the React app can exercise those edits against the React app repository.

Do not edit an installed package copy or the legacy embedded validator directory as a substitute for standalone validator source changes.

## Maintenance

If the devcontainer baseline changes, update `.devcontainer/devcontainer.json` + this file together.
