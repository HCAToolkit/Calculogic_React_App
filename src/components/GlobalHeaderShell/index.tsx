import { GlobalHeaderShell } from './GlobalHeaderShell.build';
import './GlobalHeaderShell.build.css';
import { useGlobalHeaderShellLogic, type GlobalHeaderShellProps } from './GlobalHeaderShell.logic';
import { GlobalHeaderShellResults } from './GlobalHeaderShell.results';
import './GlobalHeaderShell.results.css';

export default function GlobalHeaderShellComponent(props: GlobalHeaderShellProps) {
  const bindings = useGlobalHeaderShellLogic(props);

  return (
    <>
      <GlobalHeaderShell {...bindings.build} />
      <GlobalHeaderShellResults {...bindings.results} />
    </>
  );
}

export type { HeaderTabId, HeaderModeId } from './GlobalHeaderShell.knowledge';
