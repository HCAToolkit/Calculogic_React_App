import { resolveHeaderDoc, type HeaderDocDefinition } from '../components/GlobalHeaderShell/GlobalHeaderShell.knowledge';

export type ContentResolution =
  | {
      kind: 'doc';
      contentId: string;
      doc: HeaderDocDefinition;
    }
  | {
      kind: 'missing';
      contentId: string;
    };

interface ContentProvider {
  id: string;
  canResolve: (contentId: string) => boolean;
  resolve: (contentId: string) => ContentResolution | null;
}

const docsProvider: ContentProvider = {
  id: 'docs',
  canResolve: contentId => contentId.startsWith('docs:'),
  resolve: contentId => {
    const docId = contentId.replace('docs:', '');
    const doc = resolveHeaderDoc(docId);
    if (!doc) {
      return {
        kind: 'missing',
        contentId,
      };
    }
    return {
      kind: 'doc',
      contentId,
      doc,
    };
  },
};

const CONTENT_PROVIDERS: ContentProvider[] = [docsProvider];

export function resolveContent(contentId: string): ContentResolution | null {
  const provider = CONTENT_PROVIDERS.find(entry => entry.canResolve(contentId));
  if (!provider) {
    return null;
  }
  return provider.resolve(contentId);
}
