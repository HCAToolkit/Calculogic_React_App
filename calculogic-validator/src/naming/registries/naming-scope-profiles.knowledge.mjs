// Transitional naming note:
// - This retained `.knowledge` path is intentionally preserved to avoid broad-churn import rewrites.
// - Runtime ownership is validator-scopes getter-backed scope profile access.
// - This module is a thin naming-owned registry/re-export seam, not a standalone policy source.
export {
  cloneScopeProfile,
  listValidatorScopes,
  getValidatorScopeProfile,
} from '../../validator-scopes.knowledge.mjs';
