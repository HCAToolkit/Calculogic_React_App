const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');

export const hasHyphenAppendedRoleAmbiguity = (basename, roleSuffixes) => {
  for (const role of roleSuffixes) {
    const pattern = new RegExp(`-${escapeRegExp(role)}\\.[^.]+$`, 'u');
    if (pattern.test(basename)) {
      return { role };
    }
  }

  return null;
};
