export const getRoleMetadata = (role, roleMetadataRegistry) =>
  roleMetadataRegistry.get(role) ?? null;

export const isDeprecatedRole = (roleMetadata) => roleMetadata?.status === 'deprecated';

export const isUnknownOrInactiveRole = (role, roleMetadata, activeRoles) =>
  !roleMetadata || !activeRoles.has(role);
