import { getContextualValidatorScopeProfile } from '../validator-scopes.logic.mjs';

const PREFERRED_VALIDATOR_SCOPE_ORDER = ['repo', 'app', 'docs', 'validator', 'system'];

export const getPreferredValidatorScopeOrder = () => [...PREFERRED_VALIDATOR_SCOPE_ORDER];

export const buildSupportedScopeToken = (supportedScopes) =>
  getPreferredValidatorScopeOrder()
    .filter((scope) => supportedScopes.includes(scope))
    .join('|');

export const buildValidatorScopeUsageLines = ({ supportedScopes, getScopeProfile }) =>
  supportedScopes.map((scope) => {
    const profile = getScopeProfile(scope);
    return `  - ${scope}: ${profile?.description ?? ''}`;
  });

export const buildValidatorScopeUsageLinesFromRuntimeProfiles = (supportedScopes, options = {}) =>
  buildValidatorScopeUsageLines({
    supportedScopes,
    getScopeProfile: (scope) => getContextualValidatorScopeProfile(scope, options),
  });
