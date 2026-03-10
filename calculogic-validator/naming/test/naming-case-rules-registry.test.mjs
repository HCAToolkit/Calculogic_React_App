import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import caseRulesRegistry from '../src/registries/_builtin/case-rules.registry.json' with { type: 'json' };
import { resolveNamingRegistryInputs } from '../src/registries/registry-state.logic.mjs';
import { toCaseRulesRuntime } from '../src/naming-runtime-converters.logic.mjs';
import { getSemanticNameCaseRule } from '../src/rules/naming-rule-check-semantic-case.logic.mjs';
import { isCanonicalSemanticName } from '../src/rules/naming-rule-check-semantic-case.logic.mjs';

const getPreparedCaseRulesRuntime = () => {
  const registryInputs = resolveNamingRegistryInputs({ config: {} });
  return toCaseRulesRuntime(registryInputs.caseRules);
};

test('semantic-name case rule runtime is sourced from builtin registry style', () => {
  const semanticCaseRule = getSemanticNameCaseRule(getPreparedCaseRulesRuntime());

  assert.equal(semanticCaseRule.style, caseRulesRegistry.semanticName.style);
  assert.equal(semanticCaseRule.style, 'kebab-case');
  assert.equal(semanticCaseRule.pattern.test('left-panel'), true);
  assert.equal(semanticCaseRule.pattern.test('leftPanel'), false);
});

test('kebab-case semantic names are canonical', () => {
  const caseRulesRuntime = getPreparedCaseRulesRuntime();
  assert.equal(isCanonicalSemanticName('leftpanel', caseRulesRuntime), true);
  assert.equal(isCanonicalSemanticName('left-panel', caseRulesRuntime), true);
  assert.equal(isCanonicalSemanticName('left-panel-v2', caseRulesRuntime), true);
  assert.equal(isCanonicalSemanticName('v2-left-panel', caseRulesRuntime), true);
});

test('non-kebab semantic names are non-canonical', () => {
  const caseRulesRuntime = getPreparedCaseRulesRuntime();
  assert.equal(isCanonicalSemanticName('LeftPanel', caseRulesRuntime), false);
  assert.equal(isCanonicalSemanticName('leftPanel', caseRulesRuntime), false);
  assert.equal(isCanonicalSemanticName('left_panel', caseRulesRuntime), false);
  assert.equal(isCanonicalSemanticName('left..panel', caseRulesRuntime), false);
  assert.equal(isCanonicalSemanticName('left--panel', caseRulesRuntime), false);
});


const makeTempRegistryRoot = () => fs.mkdtempSync(path.join(os.tmpdir(), 'case-rules-registry-'));

const writeJson = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
};

const seedCaseRulesRegistryFixture = (
  tempRoot,
  {
    includeCustomCaseRules = false,
    customCaseRules = { semanticName: { style: 'kebab-case' } },
  } = {},
) => {
  writeJson(path.join(tempRoot, 'registry-state.json'), {
    schemaVersion: '1',
    activeRegistry: 'custom',
  });

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
  writeJson(path.join(tempRoot, '_builtin', 'overlay-capabilities.registry.json'), {
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
  });
  writeJson(path.join(tempRoot, '_builtin', 'case-rules.registry.json'), {
    semanticName: { style: 'kebab-case' },
  });

  writeJson(path.join(tempRoot, '_custom', 'roles.registry.custom.json'), [
    { role: 'host', category: 'architecture-support', status: 'active' },
  ]);
  writeJson(path.join(tempRoot, '_custom', 'reportable-extensions.registry.custom.json'), ['.ts']);

  if (includeCustomCaseRules) {
    writeJson(path.join(tempRoot, '_custom', 'case-rules.registry.custom.json'), customCaseRules);
  }
};

test('custom case-rules file overrides builtin when present', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    seedCaseRulesRegistryFixture(tempRoot, {
      includeCustomCaseRules: true,
      customCaseRules: { semanticName: { style: 'kebab-case' } },
    });

    const result = resolveNamingRegistryInputs({ registryRootDir: tempRoot });
    assert.deepEqual(result.caseRules, { semanticName: { style: 'kebab-case' } });
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('custom registry falls back to builtin case-rules when custom case-rules file is absent', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    seedCaseRulesRegistryFixture(tempRoot);

    const result = resolveNamingRegistryInputs({ registryRootDir: tempRoot });
    assert.deepEqual(result.caseRules, { semanticName: { style: 'kebab-case' } });
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});


test('unsupported case-rules style still throws deterministically at runtime preparation', () => {
  const registryInputs = resolveNamingRegistryInputs({
    config: {
      naming: {
        caseRules: {
          semanticName: { style: 'snake_case' },
        },
      },
    },
  });

  assert.throws(
    () => toCaseRulesRuntime(registryInputs.caseRules),
    /Unsupported semantic-name style in case rules runtime: snake_case/u,
  );
});
