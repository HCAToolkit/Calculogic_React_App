import test from 'node:test';
import assert from 'node:assert/strict';
import { ContentProviderRegistry, parseContentRef, splitNamespace } from '../src/doc-engine/index.ts';

const createMockDocsProvider = () => ({
  resolveContent: ({ contentId, anchorId }) => {
    if (contentId !== 'doc-build') {
      return {
        type: 'missing_content',
        namespace: 'docs',
        contentId,
        reason: 'Documentation entry was not found.',
      };
    }

    return {
      type: 'found',
      namespace: 'docs',
      contentId,
      anchorId,
      payload: { title: 'Build Docs' },
    };
  },
});

const createRegistry = () => {
  const registry = new ContentProviderRegistry();
  registry.registerProvider('docs', createMockDocsProvider());
  return registry;
};

test('parseContentRef parses docs:abc as valid', () => {
  assert.deepEqual(parseContentRef('docs:abc'), {
    type: 'valid',
    namespace: 'docs',
    resolvedId: 'abc',
  });
});

test('parseContentRef returns invalid_ref for abc', () => {
  assert.deepEqual(parseContentRef('abc'), {
    type: 'invalid_ref',
    contentId: 'abc',
    reason: 'Content id must include a namespace prefix and payload (namespace:id).',
  });
});

test('contentProviderRegistry resolves unknown id in docs to missing_content', () => {
  const contentProviderRegistry = createRegistry();
  const missing = contentProviderRegistry.resolveContent({ contentId: 'docs:not-real' });
  assert.deepEqual(missing, {
    type: 'missing_content',
    namespace: 'docs',
    contentId: 'not-real',
    reason: 'Documentation entry was not found.',
  });
});

test('contentProviderRegistry resolves otherns:x to no_provider when only docs provider exists', () => {
  const contentProviderRegistry = createRegistry();
  const unsupported = contentProviderRegistry.resolveContent({ contentId: 'otherns:x' });
  assert.deepEqual(unsupported, {
    type: 'no_provider',
    namespace: 'otherns',
    contentId: 'x',
    reason: 'No content provider registered for namespace: otherns.',
  });
});

test('splitNamespace preserves backward-compatible parsing shape', () => {
  assert.deepEqual(splitNamespace('docs:doc-build'), {
    namespace: 'docs',
    resolvedId: 'doc-build',
  });
  assert.deepEqual(splitNamespace('docs:'), { namespace: null, resolvedId: null });
});
