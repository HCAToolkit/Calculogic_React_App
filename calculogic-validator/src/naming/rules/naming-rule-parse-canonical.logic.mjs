export const parseCanonicalName = basename => {
  const parts = basename.split('.');

  if (parts.length < 3) {
    return null;
  }

  if (parts[parts.length - 2] === 'module' && parts[parts.length - 1] === 'css' && parts.length >= 4) {
    return {
      semanticName: parts.slice(0, -3).join('.'),
      role: parts[parts.length - 3],
      extension: 'module.css',
    };
  }

  return {
    semanticName: parts.slice(0, -2).join('.'),
    role: parts[parts.length - 2],
    extension: parts[parts.length - 1],
  };
};
