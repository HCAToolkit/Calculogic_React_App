import React from 'react';
import { useStore } from '../state/useStore';

export default function BuildTab() {
  const structure = useStore((s) => s.structure);
  const setStructure = useStore((s) => s.setStructure);

  const addField = () => {
    const next = {
      id: `field${structure.length + 1}`,
      type: 'number',
      label: `Field ${structure.length + 1}`,
    };
    setStructure([...structure, next]);
  };

  return (
    <div>
      <h2>🛠️ Build Tab</h2>
      <button onClick={addField}>+ Add Number Field</button>
      <ul>
        {structure.map((f) => (
          <li key={f.id}>
            {f.label} — {f.type}
          </li>
        ))}
      </ul>
      <p>Your form fields will show up here.</p>
    </div>
  );
}
