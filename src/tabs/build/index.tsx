import { BuildSurface } from './BuildSurface.build';
import { useBuildSurfaceLogic } from './BuildSurface.logic';
import './BuildSurface.view.css';

export default function BuildTab() {
  const bindings = useBuildSurfaceLogic();
  return <BuildSurface {...bindings} />;
}
