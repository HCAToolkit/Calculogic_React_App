/**
 * ProjectShell/Config: Global Header Shell (shell-globalHeader)
 * Concern File: EntryPoint
 * Source NL: doc/nl-shell/shell-globalHeader.md
 * Responsibility: Wire logic bindings to build/results concerns without duplicating responsibilities.
 * Invariants: Imports remain limited to annotated concern files; component stays stateless.
 */
import { GlobalHeaderShell } from './global-header-shell.build';
import './global-header-shell.build.css';
import {
  useGlobalHeaderShellLogic,
  type GlobalHeaderShellProps,
} from './global-header-shell.logic';
import { GlobalHeaderShellResults } from './global-header-shell.results';
import './global-header-shell.results.css';

// Delegates rendering to annotated build/results concerns; this file remains glue-only.
export default function GlobalHeaderShellComponent(props: GlobalHeaderShellProps) {
  const bindings = useGlobalHeaderShellLogic(props);

  return (
    <>
      <GlobalHeaderShell {...bindings.build} />
      <GlobalHeaderShellResults {...bindings.results} />
    </>
  );
}

export type { HeaderTabId, HeaderModeId } from './global-header-shell.knowledge';
