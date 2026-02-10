import { HEADER_DOC_DEFINITIONS } from '../components/GlobalHeaderShell/GlobalHeaderShell.knowledge';

export interface ContentResolutionRequest<Context = unknown> {
  contentId: string;
  anchorId?: string;
  context?: Context;
}

export interface ContentNode<Payload = unknown> {
  type: 'content';
  namespace: string;
  contentId: string;
  anchorId?: string;
  payload: Payload;
}

export interface NotFound {
  type: 'not_found';
  namespace?: string;
  contentId: string;
  reason: string;
}

export interface ContentProvider<Context = unknown, Payload = unknown> {
  resolveContent: (request: ContentResolutionRequest<Context>) => ContentNode<Payload> | NotFound;
}

export class ContentProviderRegistry {
  private providers = new Map<string, ContentProvider>();

  registerProvider(namespace: string, provider: ContentProvider) {
    this.providers.set(namespace, provider);
  }

  resolveContent<Context = unknown>({
    contentId,
    anchorId,
    context,
  }: ContentResolutionRequest<Context>): ContentNode | NotFound {
    const { namespace, resolvedId } = splitNamespace(contentId);

    if (!namespace || !resolvedId) {
      return {
        type: 'not_found',
        contentId,
        reason: 'Content id must include a namespace prefix.',
      };
    }

    const provider = this.providers.get(namespace);

    if (!provider) {
      return {
        type: 'not_found',
        namespace,
        contentId: resolvedId,
        reason: `No content provider registered for namespace: ${namespace}.`,
      };
    }

    return provider.resolveContent({ contentId: resolvedId, anchorId, context });
  }
}

const DOCS_PROVIDER: ContentProvider = {
  resolveContent: ({ contentId, anchorId }) => {
    const doc = HEADER_DOC_DEFINITIONS[contentId];

    if (!doc) {
      return {
        type: 'not_found',
        namespace: 'docs',
        contentId,
        reason: 'Documentation entry was not found.',
      };
    }

    return {
      type: 'content',
      namespace: 'docs',
      contentId,
      anchorId,
      payload: doc,
    };
  },
};

export const contentProviderRegistry = new ContentProviderRegistry();
contentProviderRegistry.registerProvider('docs', DOCS_PROVIDER);

function splitNamespace(contentId: string): { namespace: string | null; resolvedId: string | null } {
  const [namespace, ...rest] = contentId.split(':');
  const resolvedId = rest.join(':');

  if (!namespace || !resolvedId) {
    return { namespace: null, resolvedId: null };
  }

  return { namespace, resolvedId };
}
