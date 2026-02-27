export const ROLE_REGISTRY = [
  { role: 'host', category: 'architecture-support', status: 'active' },
  { role: 'wiring', category: 'architecture-support', status: 'active' },
  { role: 'contracts', category: 'architecture-support', status: 'active' },
  { role: 'build', category: 'concern-core', status: 'active' },
  { role: 'build-style', category: 'concern-core', status: 'active' },
  { role: 'logic', category: 'concern-core', status: 'active' },
  { role: 'knowledge', category: 'concern-core', status: 'active' },
  { role: 'results', category: 'concern-core', status: 'active' },
  { role: 'results-style', category: 'concern-core', status: 'active' },
  {
    role: 'view',
    category: 'deprecated',
    status: 'deprecated',
    notes: 'Historical role from pre-current concern split; manual migration required.',
  },
];

export const ROLE_METADATA = new Map(ROLE_REGISTRY.map(entry => [entry.role, entry]));
export const ACTIVE_ROLES = new Set(ROLE_REGISTRY.filter(entry => entry.status === 'active').map(entry => entry.role));
export const ROLE_SUFFIXES = ROLE_REGISTRY.map(entry => entry.role).sort((a, b) => b.length - a.length);
