// src/features/MappingTool/MappingToolPage.js

import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useMappingStore } from './useMappingStore';
import { buildObjectFromNodes } from './utils/buildObjectFromNodes';
import { exportAsJson, exportAsXlsx } from './utils/exportUtils';
import { buildTreeFromIds, filterTree } from './utils/viewUtils';
import JsonTreeView from './components/JsonTreeView';
import MappingTable from './components/MappingTable';
import JsonAsTable from './components/JsonAsTable';
import JsonEditorPanel from './components/JsonEditorPanel';
import ExportControls from './components/ExportControls';
import { useDebounceValue } from '../../hooks/useDebounceValue';
import './MappingTool.css';

function MappingToolPage() {
  const store = useMappingStore(state => state);
  const {
    loadJsonData,
    importStateFromJson,
    addMapping,
    deleteMapping,
    updateNode,
    updateMetadataField,
    reconcileJsonString,
  } = store;

  const [sourceViewMode, setSourceViewMode] = useState('view');
  const [targetViewMode, setTargetViewMode] = useState('view');

  const [sourceJsonString, setSourceJsonString] = useState('{}');
  const [targetJsonString, setTargetJsonString] = useState('{}');

  const [isSourceJsonValid, setIsSourceJsonValid] = useState(true);
  const [isTargetJsonValid, setIsTargetJsonValid] = useState(true);
  
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [mappingSearch, setMappingSearch] = useState('');
  const [sourceTableSearch, setSourceTableSearch] = useState('');
  const [targetTableSearch, setTargetTableSearch] = useState('');
  const [activeTab, setActiveTab] = useState('mapping');
  
  const sourceFileRef = useRef(null);
  const targetFileRef = useRef(null);
  const importFileRef = useRef(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const debouncedSourceString = useDebounceValue(sourceJsonString, 500);
  const debouncedTargetString = useDebounceValue(targetJsonString, 500);

  useEffect(() => {
    if (isSourceJsonValid) {
      reconcileJsonString('source', debouncedSourceString);
    }
  }, [debouncedSourceString, isSourceJsonValid, reconcileJsonString]);

  useEffect(() => {
    if (isTargetJsonValid) {
      reconcileJsonString('target', debouncedTargetString);
    }
  }, [debouncedTargetString, isTargetJsonValid, reconcileJsonString]);

  useEffect(() => {
    const newJsonObject = buildObjectFromNodes(store.sourceRootIds, store.sourceNodes);
    const newJsonString = JSON.stringify(newJsonObject, null, 2);
    if (newJsonString !== sourceJsonString) {
        setSourceJsonString(newJsonString);
    }
  }, [store.sourceNodes, store.sourceRootIds, sourceJsonString]);

  useEffect(() => {
    const newJsonObject = buildObjectFromNodes(store.targetRootIds, store.targetNodes);
    const newJsonString = JSON.stringify(newJsonObject, null, 2);
    if (newJsonString !== targetJsonString) {
        setTargetJsonString(newJsonString);
    }
  }, [store.targetNodes, store.targetRootIds, targetJsonString]);

  const handleFileLoad = (e, isSource) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonString = event.target.result;
      const { success } = loadJsonData(jsonString, isSource);
      if (success) {
        if (isSource) {
          setIsSourceJsonValid(true);
        } else {
          setIsTargetJsonValid(true);
        }
      }
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const jsonString = event.target.result;
        importStateFromJson(jsonString);
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;
    const activeNode = active.data.current.node;
    const overNode = over.data.current.node;
    const activeOrigin = active.data.current.origin;
    const overOrigin = over.data.current.origin;
    if (activeOrigin === overOrigin) return;
    if (activeNode.childrenIds.length > 0 || overNode.childrenIds.length > 0) return;
    let sourceNode, targetNode;
    if (activeOrigin === 'source' && overOrigin === 'target') {
      sourceNode = activeNode;
      targetNode = overNode;
    } else if (activeOrigin === 'target' && overOrigin === 'source') {
      sourceNode = overNode;
      targetNode = activeNode;
    } else { return; }
    addMapping(sourceNode, targetNode);
  };
  
  const { mappedSourceIds, mappedTargetIds } = useMemo(() => {
    const mappedSourceIds = new Set(store.mappings.map(m => m.sourceId));
    const mappedTargetIds = new Set(store.mappings.map(m => m.targetId));
    return { mappedSourceIds, mappedTargetIds };
  }, [store.mappings]);

  const sourceJsonTree = useMemo(() => buildTreeFromIds(store.sourceRootIds, store.sourceNodes), [store.sourceRootIds, store.sourceNodes]);
  const targetJsonTree = useMemo(() => buildTreeFromIds(store.targetRootIds, store.targetNodes), [store.targetRootIds, store.targetNodes]);

  const filteredSourceJson = useMemo(() => filterTree(sourceJsonTree, sourceSearch), [sourceJsonTree, sourceSearch]);
  const filteredTargetJson = useMemo(() => filterTree(targetJsonTree, targetSearch), [targetJsonTree, targetSearch]);

  const filteredMappings = useMemo(() => {
    if (!mappingSearch) return store.mappings;
    const lowercasedTerm = mappingSearch.toLowerCase();
    return store.mappings.filter(m => {
        const sourceNode = store.sourceNodes.get(m.sourceId);
        const targetNode = store.targetNodes.get(m.targetId);
        if (!sourceNode || !targetNode) return false;
        const s_meta = store.sourceFieldMetadata[sourceNode.path] || {};
        const t_meta = store.targetFieldMetadata[targetNode.path] || {};
        return (
            sourceNode.path.toLowerCase().includes(lowercasedTerm) ||
            targetNode.path.toLowerCase().includes(lowercasedTerm) ||
            (s_meta.description || '').toLowerCase().includes(lowercasedTerm) ||
            (t_meta.description || '').toLowerCase().includes(lowercasedTerm)
        );
    });
  }, [store.mappings, mappingSearch, store.sourceNodes, store.targetNodes, store.sourceFieldMetadata, store.targetFieldMetadata]);

  const flatSourceJson = useMemo(() => Array.from(store.sourceNodes.values()), [store.sourceNodes]);
  const flatTargetJson = useMemo(() => Array.from(store.targetNodes.values()), [store.targetNodes]);
  
  const filteredFlatSourceJson = useMemo(() => {
      if (!sourceTableSearch) return flatSourceJson;
      const lowercasedTerm = sourceTableSearch.toLowerCase();
      return flatSourceJson.filter(node => {
          const meta = store.sourceFieldMetadata[node.path] || {};
          return (
              node.path.toLowerCase().includes(lowercasedTerm) ||
              node.key.toLowerCase().includes(lowercasedTerm) ||
              String(node.value ?? '').toLowerCase().includes(lowercasedTerm) ||
              (meta.description || '').toLowerCase().includes(lowercasedTerm) ||
              (meta.example || '').toLowerCase().includes(lowercasedTerm)
          );
      });
  }, [flatSourceJson, sourceTableSearch, store.sourceFieldMetadata]);

  const filteredFlatTargetJson = useMemo(() => {
      if (!targetTableSearch) return flatTargetJson;
      const lowercasedTerm = targetTableSearch.toLowerCase();
      return flatTargetJson.filter(node => {
          const meta = store.targetFieldMetadata[node.path] || {};
          return (
              node.path.toLowerCase().includes(lowercasedTerm) ||
              node.key.toLowerCase().includes(lowercasedTerm) ||
              String(node.value ?? '').toLowerCase().includes(lowercasedTerm) ||
              (meta.description || '').toLowerCase().includes(lowercasedTerm) ||
              (meta.example || '').toLowerCase().includes(lowercasedTerm)
          );
      });
  }, [flatTargetJson, targetTableSearch, store.targetFieldMetadata]);

  const handleExportJson = () => {
    const { mappings, sourceNodes, targetNodes, sourceRootIds, targetRootIds, sourceFieldMetadata, targetFieldMetadata } = store;

    const exportData = {
        mappings: mappings.map(m => {
            const sourceNode = sourceNodes.get(m.sourceId);
            const targetNode = targetNodes.get(m.targetId);
            return {
                source: sourceNode ? sourceNode.path.replace(/^root\.?/, '') : 'N/A',
                target: targetNode ? targetNode.path.replace(/^root\.?/, '') : 'N/A',
            };
        }),
        source_data_preview: buildObjectFromNodes(sourceRootIds, sourceNodes),
        target_data_preview: buildObjectFromNodes(targetRootIds, targetNodes),
        source_field_metadata: sourceFieldMetadata,
        target_field_metadata: targetFieldMetadata,
    };
    
    exportAsJson(exportData, `mapping-${Date.now()}.json`);
  };

  const handleExportExcel = () => {
    const { mappings, sourceNodes, targetNodes, sourceFieldMetadata, targetFieldMetadata } = store;
    
    const yesNo = (val) => val ? 'Да' : 'Нет';

    const mappingData = mappings.map(m => {
        const sourceNode = sourceNodes.get(m.sourceId);
        const targetNode = targetNodes.get(m.targetId);
        if (!sourceNode || !targetNode) return null;
        const s_meta = sourceFieldMetadata[sourceNode.path] || {};
        const t_meta = targetFieldMetadata[targetNode.path] || {};
        return {
            'Путь А': sourceNode.path,
            'Тип А': sourceNode.type,
            'Обяз. А': yesNo(s_meta.required),
            'Описание А': s_meta.description || '',
            'Пример А': s_meta.example || '',
            'Путь Б': targetNode.path,
            'Тип Б': targetNode.type,
            'Обяз. Б': yesNo(t_meta.required),
            'Описание Б': t_meta.description || '',
            'Пример Б': t_meta.example || '',
        };
    }).filter(Boolean);

    const sourceData = Array.from(sourceNodes.values()).map(node => {
        const meta = sourceFieldMetadata[node.path] || {};
        return {
            'Путь': node.path,
            'Ключ': node.key,
            'Значение': node.type !== 'object' && node.type !== 'array' ? String(node.value ?? '') : '',
            'Тип': node.type,
            'Описание': meta.description || '',
            'Пример': meta.example || '',
        };
    });

    const targetData = Array.from(targetNodes.values()).map(node => {
        const meta = targetFieldMetadata[node.path] || {};
        return {
            'Путь': node.path,
            'Ключ': node.key,
            'Значение': node.type !== 'object' && node.type !== 'array' ? String(node.value ?? '') : '',
            'Тип': node.type,
            'Описание': meta.description || '',
            'Пример': meta.example || '',
        };
    });

    const worksheets = {
        'Таблица маппинга': mappingData,
        'Система А': sourceData,
        'Система Б': targetData,
    };

    exportAsXlsx(worksheets, `mapping-${Date.now()}.xlsx`);
  };


  const handleUpdateNode = useCallback((...args) => updateNode(...args), [updateNode]);
  const handleDeleteMapping = useCallback((...args) => deleteMapping(...args), [deleteMapping]);
  const handleUpdateMetadata = useCallback((...args) => updateMetadataField(...args), [updateMetadataField]);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="mapping-tool-page">
        <div className="mapping-tool-header">
            <h1>Инструмент маппинга данных</h1>
            <div className="header-actions">
              <button className="import-btn" onClick={() => importFileRef.current.click()}>Импорт</button>
              <ExportControls onExportJson={handleExportJson} onExportExcel={handleExportExcel} />
            </div>
        </div>
        <input type="file" accept=".json" ref={sourceFileRef} style={{ display: 'none' }} onChange={(e) => handleFileLoad(e, true)} />
        <input type="file" accept=".json" ref={targetFileRef} style={{ display: 'none' }} onChange={(e) => handleFileLoad(e, false)} />
        <input type="file" accept=".json" ref={importFileRef} style={{ display: 'none' }} onChange={handleImportFile} />
        
        <div className="mapping-tool-container">
          <div className="json-panel source-panel">
            <div className="panel-header">
              <h3>Система А</h3>
              <div className="panel-view-controls">
                <button 
                  className={`view-toggle-btn ${sourceViewMode === 'view' ? 'active' : ''}`}
                  title="Режим маппинга"
                  onClick={() => setSourceViewMode('view')}
                  disabled={!isSourceJsonValid}
                >
                  Маппинг
                </button>
                <button 
                  className={`view-toggle-btn ${sourceViewMode === 'edit' ? 'active' : ''}`}
                  title="Режим редактирования кода"
                  onClick={() => setSourceViewMode('edit')}
                >
                  Код
                </button>
              </div>
              <div className="panel-controls">
                <input type="search" placeholder="Поиск..." className="search-input" value={sourceSearch} onChange={e => setSourceSearch(e.target.value)} disabled={sourceViewMode === 'edit'}/>
                <button onClick={() => sourceFileRef.current.click()}>Загрузить JSON</button>
              </div>
            </div>
            <div className="panel-content">
              {sourceViewMode === 'view' ? (
                store.sourceRootIds?.length > 0 ? (
                  <JsonTreeView data={filteredSourceJson} origin="source" mappedIds={mappedSourceIds} forceExpand={!!sourceSearch} onUpdateNode={handleUpdateNode} />
                ) : (<p className="placeholder-text">Загрузите JSON-файл источника...</p>)
              ) : (
                <JsonEditorPanel
                  value={sourceJsonString}
                  onValueChange={setSourceJsonString}
                  onValidationChange={setIsSourceJsonValid}
                />
              )}
            </div>
          </div>
          <div className="json-panel target-panel">
            <div className="panel-header">
              <h3>Система Б</h3>
               <div className="panel-view-controls">
                <button 
                  className={`view-toggle-btn ${targetViewMode === 'view' ? 'active' : ''}`}
                  title="Режим маппинга"
                  onClick={() => setTargetViewMode('view')}
                  disabled={!isTargetJsonValid}
                >
                  Маппинг
                </button>
                <button 
                  className={`view-toggle-btn ${targetViewMode === 'edit' ? 'active' : ''}`}
                  title="Режим редактирования кода"
                  onClick={() => setTargetViewMode('edit')}
                >
                  Код
                </button>
              </div>
              <div className="panel-controls">
                <input type="search" placeholder="Поиск..." className="search-input" value={targetSearch} onChange={e => setTargetSearch(e.target.value)} disabled={targetViewMode === 'edit'}/>
                <button onClick={() => targetFileRef.current.click()}>Загрузить JSON</button>
              </div>
            </div>
            <div className="panel-content">
              {targetViewMode === 'view' ? (
                store.targetRootIds?.length > 0 ? (
                  <JsonTreeView data={filteredTargetJson} origin="target" mappedIds={mappedTargetIds} forceExpand={!!targetSearch} onUpdateNode={handleUpdateNode} />
                ) : (<p className="placeholder-text">Загрузите JSON-файл цели...</p>)
              ) : (
                 <JsonEditorPanel
                  value={targetJsonString}
                  onValueChange={setTargetJsonString}
                  onValidationChange={setIsTargetJsonValid}
                />
              )}
            </div>
          </div>
        </div>
        
        <div className="mapping-table-panel">
          <div className="panel-header">
            <div className="tab-navigation">
              <button className={`tab-button ${activeTab === 'mapping' ? 'active' : ''}`} onClick={() => setActiveTab('mapping')}>Таблица маппинга</button>
              <button className={`tab-button ${activeTab === 'source' ? 'active' : ''}`} onClick={() => setActiveTab('source')}>Система А</button>
              <button className={`tab-button ${activeTab === 'target' ? 'active' : ''}`} onClick={() => setActiveTab('target')}>Система Б</button>
            </div>
            <div className="panel-controls">
                {activeTab === 'mapping' && ( <input type="search" placeholder="Поиск по путям и описаниям..." className="search-input mapping-search" value={mappingSearch} onChange={e => setMappingSearch(e.target.value)} /> )}
                {activeTab === 'source' && ( <input type="search" placeholder="Поиск по таблице..." className="search-input mapping-search" value={sourceTableSearch} onChange={e => setSourceTableSearch(e.target.value)} /> )}
                {activeTab === 'target' && ( <input type="search" placeholder="Поиск по таблице..." className="search-input mapping-search" value={targetTableSearch} onChange={e => setTargetTableSearch(e.target.value)} /> )}
            </div>
          </div>
          <div className="panel-content">
            {activeTab === 'mapping' && ( <MappingTable mappings={filteredMappings} sourceNodes={store.sourceNodes} targetNodes={store.targetNodes} sourceMetadata={store.sourceFieldMetadata} targetMetadata={store.targetFieldMetadata} onDeleteMapping={handleDeleteMapping} onUpdateMetadata={handleUpdateMetadata} onUpdateNode={handleUpdateNode} /> )}
            {activeTab === 'source' && ( <JsonAsTable nodes={filteredFlatSourceJson} origin="source" onUpdateNode={handleUpdateNode} metadata={store.sourceFieldMetadata} onUpdateMetadata={handleUpdateMetadata} /> )}
            {activeTab === 'target' && ( <JsonAsTable nodes={filteredFlatTargetJson} origin="target" onUpdateNode={handleUpdateNode} metadata={store.targetFieldMetadata} onUpdateMetadata={handleUpdateMetadata} /> )}
          </div>
        </div>
      </div>
    </DndContext>
  );
}

export default MappingToolPage;