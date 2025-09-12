// --- START OF FILE src/features/MappingTool/components/JsonAsTable.js ---

import React, { memo } from 'react';
import EditableField from './EditableField';
import TypeSelector from './TypeSelector';

const ConditionallyEditableField = ({ isEditable = true, ...props }) => {
  if (!isEditable) {
    return <span className={props.className}>{props.initialValue}</span>;
  }
  return <EditableField {...props} />;
};

function JsonAsTable({ nodes, origin, onUpdateNode, metadata, onUpdateMetadata }) {
  const columnWidths = {
    path: '30%',
    key: '15%',
    value: '15%',
    type: '10%',
    description: '15%',
    example: '15%',
  };

  if (!nodes || nodes.length === 0) {
    return <p className="placeholder-text">Нет данных для отображения. Загрузите JSON-файл или измените фильтр поиска.</p>;
  }

  const columns = [
    { title: 'Путь', key: 'path' },
    { title: 'Ключ', key: 'key' },
    { title: 'Значение', key: 'value' },
    { title: 'Тип', key: 'type' },
    { title: 'Описание', key: 'description' },
    { title: 'Пример', key: 'example' },
  ];

  return (
    <div className="mapping-table-wrapper">
      <table className="mapping-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className="mapping-table-th" style={{ width: columnWidths[col.key] }}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => {
            const nodeMeta = metadata[node.path] || {};
            const isKeyEditable = !(node.parent?.type === 'array'); 

            return (
              <tr key={node.id}>
                <td>{node.path}</td>
                <td>
                  <ConditionallyEditableField
                    initialValue={node.key}
                    onSave={(newKey) => onUpdateNode(origin, node.id, 'key', newKey)}
                    isEditable={isKeyEditable}
                  />
                </td>
                <td>
                  {node.type !== 'object' && node.type !== 'array' ? (
                    <EditableField
                      initialValue={String(node.value ?? '')}
                      onSave={(newValue) => onUpdateNode(origin, node.id, 'value', newValue)}
                    />
                  ) : null}
                </td>
                <td>
                  <TypeSelector
                    currentType={node.type}
                    onChange={(newType) => onUpdateNode(origin, node.id, 'type', newType)}
                  />
                </td>
                <td>
                   <input type="text" className="meta-input" value={nodeMeta.description || ''} onChange={(e) => onUpdateMetadata(origin === 'source', node.path, 'description', e.target.value)} placeholder="Описание..."/>
                </td>
                <td>
                  <input type="text" className="meta-input" value={nodeMeta.example || ''} onChange={(e) => onUpdateMetadata(origin === 'source', node.path, 'example', e.target.value)} placeholder="Пример..."/>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default memo(JsonAsTable);