import {
  collectNamingSemanticFamilyBridgeFindings,
} from './tree-naming-semantic-family-bridge-contributor.logic.mjs';

export const attachTreeNamingSemanticFamilyBridgeContributor = ({ namingSemanticFamilyBridge }) => {
  if (namingSemanticFamilyBridge === undefined) {
    return null;
  }

  return () => collectNamingSemanticFamilyBridgeFindings(namingSemanticFamilyBridge);
};
