// --- START OF FILE src/features/MappingTool/components/JsonNode.js ---

import React, { useState, useEffect, memo } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import EditableField from './EditableField';
import TypeSelector from './TypeSelector';

const JsonValue = ({ type, value, onSave }) => {
  if (type === 'null') return <span className="json-value-null">null</span>;

  if (['string', 'number', 'boolean'].includes(type)) {
    return (
      <EditableField
        initialValue={String(value ?? '')}
        onSave={onSave}
        className={`json-value-${type}`}
      />
    );
  }
  return <span className={`json-value-${type}`}>{String(value)}</span>;
};

function JsonNode({ node, origin, mappedIds, forceExpand, onUpdateNode }) {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => { if (forceExpand) { setIsExpanded(true); } }, [forceExpand]);

  const { attributes, listeners, setNodeRef: setDraggableNodeRef, isDragging } = useDraggable({ id: node.id, data: { node, origin } });
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({ id: node.id, data: { node, origin } });
  const setNodeRef = (el) => { setDraggableNodeRef(el); setDroppableNodeRef(el); };
  
  const hasChildren = node.children && node.children.length > 0;
  const handleToggle = (e) => { e.stopPropagation(); if (hasChildren) setIsExpanded(!isExpanded); };
  const isNodeMapped = mappedIds.has(node.id);
  const nodeClasses = ['json-node', isDragging ? 'is-dragging' : '', isOver ? 'is-over' : '', isNodeMapped ? 'is-mapped' : '', hasChildren ? 'has-children' : 'is-leaf'].join(' ');

  return (
    <div className="json-node-wrapper">
      <div ref={setNodeRef} className={nodeClasses} style={{ paddingLeft: `${node.level * 20}px` }} {...attributes} {...listeners} onClick={handleToggle}>
        <span className={`toggle-icon ${hasChildren ? 'visible' : ''} ${isExpanded ? 'expanded' : ''}`}>{hasChildren && '▼'}</span>
        
        <span className="json-key">{node.key}</span>
        <span>:</span>

        {!hasChildren && (
          <span className="json-value">
            <JsonValue 
              type={node.type} 
              value={node.value} 
              onSave={(newValue) => onUpdateNode(origin, node.id, 'value', newValue)}
            />
          </span>
        )}
        
        <TypeSelector 
          currentType={node.type}
          onChange={(newType) => onUpdateNode(origin, node.id, 'type', newType)}
        />
        
      </div>

      {(isExpanded || forceExpand) && hasChildren && (
        <div className="json-children">
          {node.children.map(childNode => (
            <JsonNode 
                key={childNode.id} 
                node={childNode} 
                origin={origin} 
                mappedIds={mappedIds} 
                forceExpand={forceExpand} 
                onUpdateNode={onUpdateNode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(JsonNode);