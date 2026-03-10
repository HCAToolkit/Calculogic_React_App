import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveNamingRegistryInputs } from '../src/registries/registry-state.logic.mjs';
import { toSummaryBucketsRuntime } from '../src/naming-runtime-converters.logic.mjs';
import { summarizeFindings } from '../src/naming-validator.logic.mjs';

const REGISTRY_MODULE_ROOT = path.resolve('calculogic-validator/naming/src/registries');

const DEFAULT_OVERLAY_CAPABILITIES_REGISTRY = {
  version: '1',
  capabilities: [
    {
      configPath: 'naming.reportableExtensions',
      operation: 'add',
      payloadType: 'string-array',
      target: 'reportableExtensions',
    },
    {
      configPath: 'naming.roles',
      operation: 'add',
      payloadType: 'role-array',
      target: 'roles',
    },
    {
      configPath: 'naming.caseRules',
      operation: 'set',
      payloadType: 'case-rules-object',
      target: 'caseRules',
    },
  ],
};


const INTENDED_BUILTIN_REPORTABLE_EXTENSIONS = [
  '.cjs',
  '.css',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mjs',
  '.ts',
  '.tsx',
];

const makeTempRegistryRoot = () => fs.mkdtempSync(path.join(os.tmpdir(), 'registry-state-test-'));

const writeJson = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
};

const assertDigestShape = (digest) => {
  assert.equal(typeof digest, 'string');
  assert.equal(digest.length, 64);
  assert.match(digest, /^[a-f0-9]{64}$/u);
};

test('defaults to builtin when registry-state.json is missing', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    const result = resolveNamingRegistryInputs({ registryRootDir: tempRoot });

    assert.equal(result.registryState, 'builtin');
    assert.equal(result.registrySource, 'builtin');
    assertDigestShape(result.registryDigests.builtin);
    assertDigestShape(result.registryDigests.custom);
    assertDigestShape(result.registryDigests.resolved);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('resolver contract shape remains stable', () => {
  const result = resolveNamingRegistryInputs();

  assert.deepEqual(Object.keys(result).sort((a, b) => a.localeCompare(b)), [
    'caseRules',
    'findingPolicy',
    'missingRolePatterns',
    'registryDigests',
    'registrySource',
    'registryState',
    'reportableExtensions',
    'reportableRootFiles',
    'roles',
    'summaryBuckets',
  ]);
  assert.deepEqual(Object.keys(result.registryDigests).sort((a, b) => a.localeCompare(b)), [
    'builtin',
    'custom',
    'resolved',
  ]);
});

test('builtin state selects builtin and digests stay stable across calls', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, 'registry-state.json'), {
      schemaVersion: '1',
      activeRegistry: 'builtin',
    });

    const first = resolveNamingRegistryInputs({ registryRootDir: tempRoot });
    const second = resolveNamingRegistryInputs({ registryRootDir: tempRoot });

    assert.equal(first.registryState, 'builtin');
    assert.equal(first.registrySource, 'builtin');
    assert.equal(first.registryDigests.builtin, second.registryDigests.builtin);
    assert.equal(first.registryDigests.custom, second.registryDigests.custom);
    assert.equal(first.registryDigests.resolved, second.registryDigests.resolved);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('builtin resolution loads roles and reportable extensions from _builtin JSON registries', () => {
  const result = resolveNamingRegistryInputs();

  const builtinRolesRegistry = JSON.parse(
    fs.readFileSync(path.join(REGISTRY_MODULE_ROOT, '_builtin', 'roles.registry.json'), 'utf8'),
  );
  const expectedRoles = Object.entries(builtinRolesRegistry.rolesByCategory)
    .flatMap(([category, entries]) =>
      entries.map((entry) => {
        const normalized = {
          role: entry.role.trim(),
          category,
          status: entry.status.trim(),
        };

        if (typeof entry.notes === 'string' && entry.notes.trim()) {
          normalized.notes = entry.notes.trim();
        }

        return normalized;
      }),
    )
    .sort((left, right) => left.role.localeCompare(right.role));

  const builtinExtensionsRegistry = JSON.parse(
    fs.readFileSync(
      path.join(REGISTRY_MODULE_ROOT, '_builtin', 'reportable-extensions.registry.json'),
      'utf8',
    ),
  );
  const expectedExtensions = [...new Set(builtinExtensionsRegistry.reportableExtensions)]
    .map((value) => value.trim())
    .sort((left, right) => left.localeCompare(right));

  const builtinRootFilesRegistry = JSON.parse(
    fs.readFileSync(
      path.join(REGISTRY_MODULE_ROOT, '_builtin', 'reportable-root-files.registry.json'),
      'utf8',
    ),
  );
  const expectedRootFiles = [...new Set(builtinRootFilesRegistry.reportableRootFiles)]
    .map((value) => value.trim())
    .sort((left, right) => left.localeCompare(right));

  assert.deepEqual(result.roles, expectedRoles);
  assert.deepEqual(result.reportableExtensions, expectedExtensions);
  assert.deepEqual(result.reportableRootFiles, expectedRootFiles);

  const builtinSummaryBucketsRegistry = JSON.parse(
    fs.readFileSync(
      path.join(REGISTRY_MODULE_ROOT, '_builtin', 'summary-buckets.registry.json'),
      'utf8',
    ),
  );

  assert.deepEqual(result.summaryBuckets, {
    classificationBuckets: builtinSummaryBucketsRegistry.classificationBuckets,
    secondaryBucketFamilies: builtinSummaryBucketsRegistry.secondaryBucketFamilies,
  });

  const builtinMissingRolePatternsRegistry = JSON.parse(
    fs.readFileSync(
      path.join(REGISTRY_MODULE_ROOT, '_builtin', 'missing-role-patterns.registry.json'),
      'utf8',
    ),
  );

  assert.deepEqual(result.missingRolePatterns.length, builtinMissingRolePatternsRegistry.missingRolePatterns.length);

  const builtinFindingPolicyRegistry = JSON.parse(
    fs.readFileSync(path.join(REGISTRY_MODULE_ROOT, '_builtin', 'finding-policy.registry.json'), 'utf8'),
  );
  assert.deepEqual(
    Object.keys(result.findingPolicy),
    Object.keys(builtinFindingPolicyRegistry.outcomes).sort((left, right) =>
      left.localeCompare(right),
    ),
  );
});

test('registryRootDir drives builtin roles, extensions, and categories from the same _builtin root', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, '_builtin', 'categories.registry.json'), {
      categories: [{ category: 'from-temp-root' }],
    });

    writeJson(path.join(tempRoot, '_builtin', 'roles.registry.json'), {
      rolesByCategory: {
        'from-temp-root': [{ role: 'temp-builtin-role', status: 'active' }],
      },
    });

    writeJson(path.join(tempRoot, '_builtin', 'reportable-extensions.registry.json'), {
      reportableExtensions: ['.tmp', '.tmp', '.alt'],
    });

    writeJson(path.join(tempRoot, '_builtin', 'reportable-root-files.registry.json'), {
      reportableRootFiles: ['root-b.json', 'root-a.json', 'root-b.json'],
    });

    writeJson(path.join(tempRoot, '_builtin', 'summary-buckets.registry.json'), {
      classificationBuckets: ['bucket-a', 'bucket-b'],
      secondaryBucketFamilies: ['codeCounts'],
    });

    writeJson(path.join(tempRoot, '_builtin', 'missing-role-patterns.registry.json'), {
      missingRolePatterns: [
        {
          patternId: 'single-extension',
          dotSegments: 2,
          semanticSegmentIndex: 0,
          extensionSegmentIndexes: [1],
        },
      ],
    });

    writeJson(path.join(tempRoot, '_builtin', 'finding-policy.registry.json'), {
      outcomes: {
        canonical: {
          code: 'TEMP_CANONICAL',
          severity: 'info',
          classification: 'canonical',
          message: 'Temporary canonical policy.',
          ruleRef: 'temp-rule-ref',
        },
      },
    });

    writeJson(
      path.join(tempRoot, '_builtin', 'overlay-capabilities.registry.json'),
      DEFAULT_OVERLAY_CAPABILITIES_REGISTRY,
    );
    writeJson(path.join(tempRoot, '_builtin', 'case-rules.registry.json'), {
      semanticName: { style: 'kebab-case' },
    });

    const builtinResult = resolveNamingRegistryInputs({ registryRootDir: tempRoot });
    assert.deepEqual(builtinResult.roles, [
      { role: 'temp-builtin-role', category: 'from-temp-root', status: 'active' },
    ]);
    assert.deepEqual(builtinResult.reportableExtensions, ['.alt', '.tmp']);
    assert.deepEqual(builtinResult.reportableRootFiles, ['root-a.json', 'root-b.json']);
    assert.deepEqual(builtinResult.summaryBuckets, {
      classificationBuckets: ['bucket-a', 'bucket-b'],
      secondaryBucketFamilies: ['codeCounts'],
    });
    assert.equal(builtinResult.missingRolePatterns.length, 1);
    assert.equal(builtinResult.findingPolicy.canonical.code, 'TEMP_CANONICAL');

    writeJson(path.join(tempRoot, 'registry-state.json'), {
      schemaVersion: '1',
      activeRegistry: 'custom',
    });
    writeJson(path.join(tempRoot, '_custom', 'roles.registry.custom.json'), [
      { role: 'temp-custom-role', category: 'from-temp-root', status: 'active' },
    ]);
    writeJson(path.join(tempRoot, '_custom', 'reportable-extensions.registry.custom.json'), ['.tmp']);

    const customResult = resolveNamingRegistryInputs({ registryRootDir: tempRoot });
    assert.ok(customResult.roles.some((entry) => entry.role === 'temp-custom-role'));
    assert.deepEqual(customResult.summaryBuckets, {
      classificationBuckets: ['bucket-a', 'bucket-b'],
      secondaryBucketFamilies: ['codeCounts'],
    });
    assert.equal(customResult.missingRolePatterns.length, 1);
    assert.equal(customResult.findingPolicy.canonical.code, 'TEMP_CANONICAL');
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});


test('registryRootDir falls back to module _builtin when temp _builtin is incomplete', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, '_builtin', 'categories.registry.json'), {
      categories: [{ category: 'from-incomplete-temp-root' }],
    });

    writeJson(path.join(tempRoot, '_builtin', 'roles.registry.json'), {
      rolesByCategory: {
        'from-incomplete-temp-root': [{ role: 'incomplete-temp-role', status: 'active' }],
      },
    });

    const moduleBuiltinResult = resolveNamingRegistryInputs();
    const incompleteBuiltinResult = resolveNamingRegistryInputs({ registryRootDir: tempRoot });

    assert.deepEqual(incompleteBuiltinResult.roles, moduleBuiltinResult.roles);
    assert.deepEqual(
      incompleteBuiltinResult.reportableExtensions,
      moduleBuiltinResult.reportableExtensions,
    );
    assert.deepEqual(
      incompleteBuiltinResult.reportableRootFiles,
      moduleBuiltinResult.reportableRootFiles,
    );
    assert.ok(
      !incompleteBuiltinResult.roles.some((entry) => entry.role === 'incomplete-temp-role'),
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
test('builtin resolved reportable extensions preserve intended parity, including .jsx and .cjs', () => {
  const result = resolveNamingRegistryInputs();

  assert.deepEqual(result.reportableExtensions, INTENDED_BUILTIN_REPORTABLE_EXTENSIONS);
  assert.ok(result.reportableExtensions.includes('.jsx'));
  assert.ok(result.reportableExtensions.includes('.cjs'));
});

test('custom state selects custom and digests diverge from builtin when payload differs', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, 'registry-state.json'), {
      schemaVersion: '1',
      activeRegistry: 'custom',
    });

    writeJson(path.join(tempRoot, '_custom', 'roles.registry.custom.json'), [
      { role: 'host', category: 'architecture-support', status: 'active' },
      { role: 'custom-role', category: 'architecture-support', status: 'active' },
    ]);

    writeJson(path.join(tempRoot, '_custom', 'reportable-extensions.registry.custom.json'), [
      '.ts',
      '.abc',
    ]);

    const result = resolveNamingRegistryInputs({ registryRootDir: tempRoot });

    assert.equal(result.registryState, 'custom');
    assert.equal(result.registrySource, 'custom');
    assert.notEqual(result.registryDigests.custom, result.registryDigests.builtin);
    assert.equal(result.registryDigests.resolved, result.registryDigests.custom);
    assert.ok(result.roles.some((entry) => entry.role === 'custom-role'));
    assert.ok(result.reportableExtensions.includes('.abc'));
    assert.ok(Array.isArray(result.summaryBuckets.classificationBuckets));
    assert.ok(Array.isArray(result.summaryBuckets.secondaryBucketFamilies));
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});


test('custom state preserves builtin summary buckets for summary runtime preparation', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, 'registry-state.json'), {
      schemaVersion: '1',
      activeRegistry: 'custom',
    });

    writeJson(path.join(tempRoot, '_custom', 'roles.registry.custom.json'), [
      { role: 'host', category: 'architecture-support', status: 'active' },
      { role: 'custom-role', category: 'architecture-support', status: 'active' },
    ]);

    writeJson(path.join(tempRoot, '_custom', 'reportable-extensions.registry.custom.json'), [
      '.ts',
      '.abc',
    ]);

    const result = resolveNamingRegistryInputs({ registryRootDir: tempRoot });
    const summaryBucketsRuntime = toSummaryBucketsRuntime(result.summaryBuckets);
    const summary = summarizeFindings([], summaryBucketsRuntime);

    assert.ok(Object.hasOwn(summary, 'counts'));
    assert.ok(Object.hasOwn(summary, 'codeCounts'));
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('throws on invalid activeRegistry value', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, 'registry-state.json'), {
      schemaVersion: '1',
      activeRegistry: 'nope',
    });

    assert.throws(
      () => resolveNamingRegistryInputs({ registryRootDir: tempRoot }),
      /Invalid activeRegistry/u,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('throws when custom is active and custom files are missing', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, 'registry-state.json'), {
      schemaVersion: '1',
      activeRegistry: 'custom',
    });

    writeJson(path.join(tempRoot, '_custom', 'roles.registry.custom.json'), [
      { role: 'host', category: 'architecture-support', status: 'active' },
    ]);

    assert.throws(
      () => resolveNamingRegistryInputs({ registryRootDir: tempRoot }),
      /Custom registry file missing: _custom\/reportable-extensions\.registry\.custom\.json\./u,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('accepts custom role category values that exist in _builtin/categories.registry.json', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, 'registry-state.json'), {
      schemaVersion: '1',
      activeRegistry: 'custom',
    });

    writeJson(path.join(tempRoot, '_custom', 'roles.registry.custom.json'), [
      { role: 'perf-role', category: 'performance', status: 'active' },
    ]);

    writeJson(path.join(tempRoot, '_custom', 'reportable-extensions.registry.custom.json'), [
      '.ts',
    ]);

    const result = resolveNamingRegistryInputs({ registryRootDir: tempRoot });
    assert.ok(result.roles.some((entry) => entry.role === 'perf-role'));
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('throws when custom roles include invalid category', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, 'registry-state.json'), {
      schemaVersion: '1',
      activeRegistry: 'custom',
    });

    writeJson(path.join(tempRoot, '_custom', 'roles.registry.custom.json'), [
      { role: 'x', category: 'nope', status: 'active' },
    ]);

    writeJson(path.join(tempRoot, '_custom', 'reportable-extensions.registry.custom.json'), [
      '.ts',
    ]);

    assert.throws(
      () => resolveNamingRegistryInputs({ registryRootDir: tempRoot }),
      /category must be one of/u,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('throws when custom roles include invalid status', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, 'registry-state.json'), {
      schemaVersion: '1',
      activeRegistry: 'custom',
    });

    writeJson(path.join(tempRoot, '_custom', 'roles.registry.custom.json'), [
      { role: 'x', category: 'architecture-support', status: 'provisional' },
    ]);

    writeJson(path.join(tempRoot, '_custom', 'reportable-extensions.registry.custom.json'), [
      '.ts',
    ]);

    assert.throws(
      () => resolveNamingRegistryInputs({ registryRootDir: tempRoot }),
      /status must be "active" or "deprecated"/u,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('throws when custom reportable extension omits leading dot', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, 'registry-state.json'), {
      schemaVersion: '1',
      activeRegistry: 'custom',
    });

    writeJson(path.join(tempRoot, '_custom', 'roles.registry.custom.json'), [
      { role: 'host', category: 'architecture-support', status: 'active' },
    ]);

    writeJson(path.join(tempRoot, '_custom', 'reportable-extensions.registry.custom.json'), ['ts']);

    assert.throws(
      () => resolveNamingRegistryInputs({ registryRootDir: tempRoot }),
      /must start with "\."|must start with "."/u,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});


test('config overlay preserves supported add-only semantics for roles and reportable extensions', () => {
  const result = resolveNamingRegistryInputs({
    config: {
      naming: {
        reportableExtensions: { add: ['.xyz', '.ts'] },
        roles: {
          add: [
            { role: 'overlay-role', category: 'architecture-support', status: 'active' },
            { role: 'host', category: 'architecture-support', status: 'active' },
          ],
        },
      },
    },
  });

  assert.equal(result.registrySource, 'config');
  assert.ok(result.reportableExtensions.includes('.xyz'));
  assert.ok(result.reportableExtensions.includes('.ts'));
  assert.ok(result.roles.some((entry) => entry.role === 'overlay-role'));
  assert.equal(result.roles.filter((entry) => entry.role === 'host').length, 1);
});

test('unsupported config overlay paths remain ignored', () => {
  const builtin = resolveNamingRegistryInputs();
  const withUnsupportedOverlay = resolveNamingRegistryInputs({
    config: {
      naming: {
        summaryBuckets: { add: ['not-supported'] },
      },
    },
  });

  assert.equal(withUnsupportedOverlay.registrySource, 'config');
  assert.deepEqual(withUnsupportedOverlay.roles, builtin.roles);
  assert.deepEqual(withUnsupportedOverlay.reportableExtensions, builtin.reportableExtensions);
  assert.deepEqual(withUnsupportedOverlay.summaryBuckets, builtin.summaryBuckets);
  assert.deepEqual(withUnsupportedOverlay.caseRules, builtin.caseRules);
});



test('config overlay supports bounded case-rules set semantics', () => {
  const result = resolveNamingRegistryInputs({
    config: {
      naming: {
        caseRules: {
          semanticName: { style: 'kebab-case' },
        },
      },
    },
  });

  assert.equal(result.registrySource, 'config');
  assert.deepEqual(result.caseRules, {
    semanticName: { style: 'kebab-case' },
  });
});

test('config overlay case-rules invalid semanticName.style throws deterministically', () => {
  assert.throws(
    () =>
      resolveNamingRegistryInputs({
        config: {
          naming: {
            caseRules: {
              semanticName: { style: '' },
            },
          },
        },
      }),
    /semanticName\.style must be a non-empty string/u,
  );
});

test('throws when overlay capabilities registry is malformed', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, '_builtin', 'categories.registry.json'), {
      categories: [{ category: 'architecture-support' }],
    });

    writeJson(path.join(tempRoot, '_builtin', 'roles.registry.json'), {
      rolesByCategory: {
        'architecture-support': [{ role: 'host', status: 'active' }],
      },
    });

    writeJson(path.join(tempRoot, '_builtin', 'reportable-extensions.registry.json'), {
      reportableExtensions: ['.ts'],
    });

    writeJson(path.join(tempRoot, '_builtin', 'reportable-root-files.registry.json'), {
      reportableRootFiles: ['package.json'],
    });

    writeJson(path.join(tempRoot, '_builtin', 'summary-buckets.registry.json'), {
      classificationBuckets: ['canonical'],
      secondaryBucketFamilies: ['codeCounts'],
    });

    writeJson(path.join(tempRoot, '_builtin', 'missing-role-patterns.registry.json'), {
      missingRolePatterns: [
        {
          patternId: 'single-extension',
          dotSegments: 2,
          semanticSegmentIndex: 0,
          extensionSegmentIndexes: [1],
        },
      ],
    });

    writeJson(path.join(tempRoot, '_builtin', 'finding-policy.registry.json'), {
      outcomes: {
        canonical: {
          code: 'NAMING_CANONICAL',
          severity: 'info',
          classification: 'canonical',
          message: 'ok',
          ruleRef: 'naming-spec',
        },
      },
    });

    writeJson(path.join(tempRoot, '_builtin', 'case-rules.registry.json'), {
      semanticName: { style: 'kebab-case' },
    });

    writeJson(path.join(tempRoot, '_builtin', 'overlay-capabilities.registry.json'), {
      version: '1',
      capabilities: [
        {
          configPath: 'naming.roles',
          operation: 'replace',
          payloadType: 'role-array',
          target: 'roles',
        },
      ],
    });

    assert.throws(
      () => resolveNamingRegistryInputs({ registryRootDir: tempRoot, config: {} }),
      /overlay-capabilities registry/u,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
