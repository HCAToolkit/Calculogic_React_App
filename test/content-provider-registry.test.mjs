import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ContentProviderRegistry,
  DOCS_PROVIDER,
  splitNamespace,
} from '../src/doc-engine/index.ts';

const createRegistry = () => {
  const registry = new ContentProviderRegistry();
  registry.registerProvider('docs', DOCS_PROVIDER);
  return registry;
};

test('splitNamespace parses namespaced ids', () => {
  assert.deepEqual(splitNamespace('docs:doc-build'), {
    namespace: 'docs',
    resolvedId: 'doc-build',
  });
});

test('splitNamespace rejects ids without a namespace payload', () => {
  assert.deepEqual(splitNamespace('docs:'), { namespace: null, resolvedId: null });
  assert.deepEqual(splitNamespace('doc-build'), { namespace: null, resolvedId: null });
});

test('contentProviderRegistry resolves registered docs content', () => {
  const contentProviderRegistry = createRegistry();
  const resolved = contentProviderRegistry.resolveContent({ contentId: 'docs:doc-build' });
  assert.equal(resolved.type, 'content');
  if (resolved.type === 'content') {
    assert.equal(resolved.namespace, 'docs');
    assert.equal(resolved.contentId, 'doc-build');
  }
});

test('contentProviderRegistry returns not_found for missing docs content', () => {
  const contentProviderRegistry = createRegistry();
  const missing = contentProviderRegistry.resolveContent({ contentId: 'docs:not-real' });
  assert.deepEqual(missing, {
    type: 'not_found',
    namespace: 'docs',
    contentId: 'not-real',
    reason: 'Documentation entry was not found.',
  });
});
