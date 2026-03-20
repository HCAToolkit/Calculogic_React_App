import { listNamingValidatorScopes, getScopeProfile } from '../naming-validator.host.mjs';

const preferredScopeOrder = ['repo', 'app', 'docs', 'validator', 'system'];

const buildScopeToken = (supportedScopes) =>
  preferredScopeOrder.filter((scope) => supportedScopes.includes(scope)).join('|');

export const buildNamingCliUsageLines = ({ commandPrefix, strictExampleCommand }) => {
  const supportedScopes = listNamingValidatorScopes();
  const supportedScopesToken = buildScopeToken(supportedScopes);

  return [
    `Usage: ${commandPrefix} [--scope=<${supportedScopesToken}>] [--target=<path>]... [--config=<path>] [--strict]`,
    'Scopes:',
    ...supportedScopes.map((scope) => {
      const profile = getScopeProfile(scope);
      return `  - ${scope}: ${profile?.description ?? ''}`;
    }),
    'Default scope: repo',
    'Examples:',
    '  ✅ npm run validate:naming -- --scope=app',
    '  ✅ npm run validate:naming -- --scope=app --target src/buildsurface',
    '  ✅ npm run validate:naming -- --scope=app --target src/buildsurface --target src/shared',
    '  ✅ npm run validate:all -- --validators=naming --scope=docs',
    '  ✅ node calculogic-validator/bin/calculogic-validate-naming.host.mjs --scope=app',
    '  ✅ node calculogic-validator/bin/calculogic-validate.host.mjs --scope=docs',
    `  ✅ ${strictExampleCommand}`,
  ];
};
