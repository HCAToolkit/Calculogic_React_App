import path from 'node:path';

const CONFUSABLE_ROLE_CATEGORIES = new Set(['surface-system', 'architecture-support']);

const toSortedUnique = (tokens) => Array.from(new Set(tokens)).sort((left, right) => left.localeCompare(right));

const collectConfusableActiveRoles = (namingRolesRuntime) =>
  Array.from(namingRolesRuntime.roleMetadata.entries()).reduce((roleSet, [role, metadata]) => {
    if (
      metadata?.status === 'active' &&
      CONFUSABLE_ROLE_CATEGORIES.has(metadata?.category) &&
      namingRolesRuntime.activeRoles.has(role)
    ) {
      roleSet.add(role);
    }

    return roleSet;
  }, new Set());

export const deriveDisambiguationHints = ({ normalizedPath, parsed, namingRolesRuntime }) => {
  const confusableRoles = collectConfusableActiveRoles(namingRolesRuntime);

  const dirname = path.posix.dirname(normalizedPath);
  const directorySegments = dirname === '.' ? [] : dirname.split('/').filter(Boolean);
  const roleLikeFolderTokens = toSortedUnique(
    directorySegments.filter((token) => token !== parsed.role && confusableRoles.has(token)),
  );

  const semanticTokens = parsed.semanticName.split(/[-.]/u).filter(Boolean);
  const roleLikeSemanticTokens = toSortedUnique(
    semanticTokens.filter((token) => token !== parsed.role && confusableRoles.has(token)),
  );

  if (roleLikeFolderTokens.length === 0 && roleLikeSemanticTokens.length === 0) {
    return null;
  }

  return {
    roleLikeSemanticTokens,
    roleLikeFolderTokens,
  };
};
