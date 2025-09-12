// --- START OF FILE src/features/MappingTool/components/MappingTable.js ---

import React, { memo } from 'react';
import EditableField from './EditableField';
import TypeSelector from './TypeSelector';


const MappingTableRow = memo(({ mapping, sourceNodes, targetNodes, sourceMetadata, targetMetadata, onDeleteMapping, onUpdateMetadata, onUpdateNode }) => {
  const sourceNode = sourceNodes.get(mapping.sourceId);
  const targetNode = targetNodes.get(mapping.targetId);

  if (!sourceNode || !targetNode) {
    return null;
  }
  
  const s_meta = sourceMetadata[sourceNode.path] || {};
  const t_meta = targetMetadata[targetNode.path] || {};
  const typesMismatch = sourceNode.type !== targetNode.type;

  const splitPath = (fullPath, key) => {
    if (!fullPath || !key) return { parent: '', key: ''};
    const lastIndex = fullPath.lastIndexOf(key);
    if (lastIndex !== -1 && lastIndex + key.length === fullPath.length) {
      const parent = fullPath.substring(0, lastIndex).replace(/(\.|\[)$/, '');
      return { parent: `${parent}${parent ? '.' : ''}`, key: key };
    }
    return { parent: '', key: fullPath };
  };
  const { parent: sourceParentPath, key: sourceKey } = splitPath(sourceNode.path, sourceNode.key);
  const { parent: targetParentPath, key: targetKey } = splitPath(targetNode.path, targetNode.key);

  return (
    <tr className={typesMismatch ? 'type-mismatch' : ''}>
      <td>
        <span style={{ color: '#6B778C' }}>{sourceParentPath.replace(/root\./, '')}</span>
        <EditableField initialValue={sourceKey} onSave={(newKey) => onUpdateNode('source', sourceNode.id, 'key', newKey)} />
      </td>
      <td><TypeSelector currentType={sourceNode.type} onChange={(newType) => onUpdateNode('source', sourceNode.id, 'type', newType)} /></td>
      <td className="cell-center"><input type="checkbox" checked={s_meta.required || false} onChange={(e) => onUpdateMetadata(true, sourceNode.path, 'required', e.target.checked)} /></td>
      <td><input type="text" className="meta-input" value={s_meta.description || ''} onChange={(e) => onUpdateMetadata(true, sourceNode.path, 'description', e.target.value)} placeholder="Описание..."/></td>
      <td><input type="text" className="meta-input" value={s_meta.example || ''} onChange={(e) => onUpdateMetadata(true, sourceNode.path, 'example', e.target.value)} placeholder="Пример..."/></td>
      <td>
        <span style={{ color: '#6B778C' }}>{targetParentPath.replace(/root\./, '')}</span>
         <EditableField initialValue={targetKey} onSave={(newKey) => onUpdateNode('target', targetNode.id, 'key', newKey)} />
      </td>
      <td><TypeSelector currentType={targetNode.type} onChange={(newType) => onUpdateNode('target', targetNode.id, 'type', newType)} /></td>
      <td className="cell-center"><input type="checkbox" checked={t_meta.required || false} onChange={(e) => onUpdateMetadata(false, targetNode.path, 'required', e.target.checked)}/></td>
      <td><input type="text" className="meta-input" value={t_meta.description || ''} onChange={(e) => onUpdateMetadata(false, targetNode.path, 'description', e.target.value)} placeholder="Описание..."/></td>
      <td><input type="text" className="meta-input" value={t_meta.example || ''} onChange={(e) => onUpdateMetadata(false, targetNode.path, 'example', e.target.value)} placeholder="Пример..."/></td>
      <td className="cell-center"><button className="delete-mapping-btn" title="Удалить маппинг" onClick={() => onDeleteMapping(mapping.id)}>&times;</button></td>
    </tr>
  );
});


function MappingTable({ mappings, sourceNodes, targetNodes, sourceMetadata, targetMetadata, onDeleteMapping, onUpdateMetadata, onUpdateNode }) {
  
  if (!mappings || mappings.length === 0) {
    return (
      <p className="placeholder-text">
        Перетащите поле из Источника на поле в Цели (или наоборот), чтобы создать маппинг.
      </p>
    );
  }
  
  const columns = [
    { title: 'Путь А', key: 'sourcePath' },
    { title: 'Тип А', key: 'sourceType' },
    { title: 'Обяз. А', key: 'sourceReq' },
    { title: 'Описание А', key: 'sourceDesc' },
    { title: 'Пример А', key: 'sourceExample' },
    { title: 'Путь Б', key: 'targetPath' },
    { title: 'Тип Б', key: 'targetType' },
    { title: 'Обяз. Б', key: 'targetReq' },
    { title: 'Описание Б', key: 'targetDesc' },
    { title: 'Пример Б', key: 'targetExample' },
    { title: 'Действия', key: 'actions' },
  ];

  return (
    <div className="mapping-table-wrapper">
      <table className="mapping-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className="mapping-table-th">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mappings.map((mapping) => (
            <MappingTableRow
              key={mapping.id}
              mapping={mapping}
              sourceNodes={sourceNodes}
              targetNodes={targetNodes}
              sourceMetadata={sourceMetadata}
              targetMetadata={targetMetadata}
              onDeleteMapping={onDeleteMapping}
              onUpdateMetadata={onUpdateMetadata}
              onUpdateNode={onUpdateNode}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(MappingTable);