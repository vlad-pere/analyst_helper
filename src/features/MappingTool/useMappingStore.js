// src/features/MappingTool/useMappingStore.js

import { create } from 'zustand';
import { produce } from 'immer';
import { buildObjectFromNodes } from './utils/buildObjectFromNodes';

let nodeIdCounter = 0;

function getType(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

const DEFAULT_FIELD_META = {
    type: 'unknown',
    required: false,
    description: '',
    example: ''
};

function getDefaultValueForType(type) {
    switch (type) {
        case 'string': return '';
        case 'number': return 0;
        case 'boolean': return false;
        case 'null': return null;
        case 'object': return null;
        case 'array': return null;
        default: return null;
    }
}

function _internalNormalize(json, prefix, oldPathToIdMap = new Map()) {
    const nodesMap = new Map();
    const rootIds = [];

    function traverse(data, parentId = null, level = 0, path = 'root') {
        const type = getType(data);
        if (type !== 'object' && type !== 'array') {
             const id = oldPathToIdMap.get(path) || `${prefix}-node-${nodeIdCounter++}`;
             const node = { id, key: 'value', value: data, type: type, level, parentId, path: path, childrenIds: [] };
             nodesMap.set(id, node);
             rootIds.push(id);
             return [id];
        }

        const entries = Array.isArray(data) ? data.entries() : Object.entries(data);
        const childrenIds = [];
        for (const [key, value] of entries) {
            const valueType = getType(value);
            const hasChildren = valueType === 'object' || valueType === 'array';
            const currentPath = Array.isArray(data) ? `${path}[${key}]` : `${path}.${key}`;
            const id = oldPathToIdMap.get(currentPath) || `${prefix}-node-${nodeIdCounter++}`;
            const node = { id, key: String(key), value: hasChildren ? null : value, type: valueType, level, parentId, path: currentPath, childrenIds: hasChildren ? traverse(value, id, level + 1, currentPath) : [] };
            nodesMap.set(id, node);
            childrenIds.push(id);
            if (parentId === null) rootIds.push(id);
        }
        return childrenIds;
    }
    
    traverse(json);

    return { nodesMap, rootIds };
}

function updateDescendantPaths(nodesMap, nodeId, parentPath, isParentArray) {
    const node = nodesMap.get(nodeId);
    if (!node) return;
    node.path = isParentArray ? `${parentPath}[${node.key}]` : `${parentPath}.${node.key}`;
    const isArray = node.type === 'array';
    node.childrenIds.forEach(childId => {
        updateDescendantPaths(nodesMap, childId, node.path, isArray);
    });
}

export const useMappingStore = create((set, get) => ({
  
  sourceNodes: new Map(),
  targetNodes: new Map(),
  sourceRootIds: [],
  targetRootIds: [],
  mappings: [],
  sourceFieldMetadata: {},
  targetFieldMetadata: {},

  loadJsonData: (jsonString, isSource) => {
    try {
      let parsedJson = JSON.parse(jsonString);
      if (getType(parsedJson) !== 'object' && getType(parsedJson) !== 'array') {
        parsedJson = { "value": parsedJson };
      }
      
      const prefix = isSource ? 'source' : 'target';
      const { nodesMap, rootIds } = _internalNormalize(parsedJson, prefix);
      
      set(produce(draft => {
        if (isSource) {
            draft.sourceNodes = nodesMap;
            draft.sourceRootIds = rootIds;
            draft.mappings = [];
        } else {
            draft.targetNodes = nodesMap;
            draft.targetRootIds = rootIds;
            draft.mappings = [];
        }
      }));

      return { success: true, data: parsedJson };
    } catch (error) { 
      alert(`Ошибка при чтении JSON: ${error.message}.`); 
      return { success: false, error };
    }
  },

  importStateFromJson: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.mappings || data.source_data_preview === undefined || data.target_data_preview === undefined || !data.source_field_metadata || !data.target_field_metadata) {
        throw new Error("Неверный формат файла импорта. Отсутствуют необходимые поля.");
      }

      const sourceJson = (getType(data.source_data_preview) !== 'object' && getType(data.source_data_preview) !== 'array') ? { "value": data.source_data_preview } : data.source_data_preview;
      const targetJson = (getType(data.target_data_preview) !== 'object' && getType(data.target_data_preview) !== 'array') ? { "value": data.target_data_preview } : data.target_data_preview;

      const { nodesMap: sourceNodes, rootIds: sourceRootIds } = _internalNormalize(sourceJson, 'source');
      const { nodesMap: targetNodes, rootIds: targetRootIds } = _internalNormalize(targetJson, 'target');

      const sourcePathToId = new Map();
      sourceNodes.forEach(node => sourcePathToId.set(node.path.replace(/^root\.?/, ''), node.id));
      
      const targetPathToId = new Map();
      targetNodes.forEach(node => targetPathToId.set(node.path.replace(/^root\.?/, ''), node.id));

      const newMappings = data.mappings.reduce((acc, m) => {
        const sourcePath = m.source.replace(/^root\.?/, '');
        const targetPath = m.target.replace(/^root\.?/, '');
        
        const sourceId = sourcePathToId.get(sourcePath);
        const targetId = targetPathToId.get(targetPath);

        if (sourceId && targetId) {
          acc.push({ id: `map-${Date.now()}-${Math.random()}`, sourceId, targetId });
        } else {
          console.warn(`Не удалось найти узлы для маппинга: ${m.source} (${sourcePath}) -> ${m.target} (${targetPath})`);
        }
        return acc;
      }, []);
      
      set({
        sourceNodes,
        sourceRootIds,
        targetNodes,
        targetRootIds,
        mappings: newMappings,
        sourceFieldMetadata: data.source_field_metadata,
        targetFieldMetadata: data.target_field_metadata,
      });

      return { success: true };

    } catch (error) {
      alert(`Ошибка импорта: ${error.message}`);
      return { success: false, error };
    }
  },

  reconcileJsonString: (origin, jsonString) => {
    set(produce(draft => {
        try {
            let newJson = JSON.parse(jsonString);
            if (getType(newJson) !== 'object' && getType(newJson) !== 'array') {
                newJson = { "value": newJson };
            }

            const nodesKey = origin === 'source' ? 'sourceNodes' : 'targetNodes';
            const rootIdsKey = origin === 'source' ? 'sourceRootIds' : 'targetRootIds';
            
            const currentObject = buildObjectFromNodes(draft[rootIdsKey], draft[nodesKey]);
            if (JSON.stringify(currentObject) === JSON.stringify(newJson)) {
                return;
            }
            
            const oldNodesMap = draft[nodesKey];
            const oldPathToIdMap = new Map();
            for (const node of oldNodesMap.values()) {
                oldPathToIdMap.set(node.path, node.id);
            }
            
            const { nodesMap: newNodesMap, rootIds: newRootIds } = _internalNormalize(newJson, origin, oldPathToIdMap);
            
            const deletedIds = new Set();
            for (const oldId of oldNodesMap.keys()) {
                if (!newNodesMap.has(oldId)) {
                    deletedIds.add(oldId);
                }
            }
            
            if (deletedIds.size > 0) {
                draft.mappings = draft.mappings.filter(m => !deletedIds.has(m.sourceId) && !deletedIds.has(m.targetId));
            }

            draft[nodesKey] = newNodesMap;
            draft[rootIdsKey] = newRootIds;

        } catch (e) {
            console.error("Reconciliation failed: Invalid JSON", e);
        }
    }));
  },

  addMapping: (sourceNode, targetNode) => {
    const newMapping = { id: `map-${Date.now()}-${Math.random()}`, sourceId: sourceNode.id, targetId: targetNode.id };
    const exists = get().mappings.some(m => m.sourceId === sourceNode.id && m.targetId === targetNode.id);
    if (!exists) set(state => ({ mappings: [...state.mappings, newMapping] }));
  },

  deleteMapping: (mappingId) => set(state => ({ mappings: state.mappings.filter(m => m.id !== mappingId) })),

  updateNode: (origin, nodeId, field, value) => {
    set(produce(state => {
        const nodesKey = origin === 'source' ? 'sourceNodes' : 'targetNodes';
        const metaKey = origin === 'source' ? 'sourceFieldMetadata' : 'targetFieldMetadata';
        const draftNodes = state[nodesKey];
        const nodeToUpdate = draftNodes.get(nodeId);
        if (nodeToUpdate) {
            if (nodeToUpdate[field] === value) return;
            const oldPath = nodeToUpdate.path;
            nodeToUpdate[field] = value;
            if (field === 'key') {
                const parent = nodeToUpdate.parentId ? draftNodes.get(nodeToUpdate.parentId) : null;
                const parentPath = parent ? parent.path : 'root';
                const isParentArray = parent ? parent.type === 'array' : false;
                updateDescendantPaths(draftNodes, nodeId, parentPath, isParentArray);
                const newPath = nodeToUpdate.path;
                if (state[metaKey][oldPath]) {
                    state[metaKey][newPath] = state[metaKey][oldPath];
                    delete state[metaKey][oldPath];
                }
            }
            if (field === 'type') {
                if (value === 'object' || value === 'array') {
                    nodeToUpdate.value = null;
                    nodeToUpdate.childrenIds = [];
                } else {
                    nodeToUpdate.value = getDefaultValueForType(value);
                    nodeToUpdate.childrenIds = []; 
                }
                if (state[metaKey][oldPath]) state[metaKey][oldPath].type = value;
            }
        }
    }));
  },

  updateMetadataField: (isSource, path, field, value) => {
    const metaKey = isSource ? 'sourceFieldMetadata' : 'targetFieldMetadata';
    set(produce(state => {
        if (!state[metaKey][path]) state[metaKey][path] = { ...DEFAULT_FIELD_META };
        state[metaKey][path][field] = value;
    }));
  },
}));