// --- START OF FILE src/features/MappingTool/components/JsonTreeView.js ---

import React from 'react';
import JsonNode from './JsonNode';

function JsonTreeView({ data, origin, mappedIds, forceExpand, onUpdateNode }) {

  return (
    <div className="json-tree-view">
      {data && data.length > 0 && data.map(node => (
        <JsonNode
          key={node.id}
          node={node}
          origin={origin}
          mappedIds={mappedIds}
          forceExpand={forceExpand}
          onUpdateNode={onUpdateNode}
        />
      ))}
    </div>
  );
}

export default JsonTreeView;