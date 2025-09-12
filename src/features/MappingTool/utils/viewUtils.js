// --- START OF FILE src/features/MappingTool/utils/viewUtils.js ---

/**
 * Рекурсивно строит иерархическое дерево узлов из плоской структуры Map.
 * Используется для подготовки данных для компонента JsonTreeView.
 * @param {string[]} rootIds - Массив ID корневых узлов.
 * @param {Map<string, object>} nodesMap - Map, где ключ - ID узла, а значение - объект узла.
 * @returns {Array} - Массив корневых узлов с вложенными дочерними элементами.
 */
export const buildTreeFromIds = (rootIds, nodesMap) => {
  if (!rootIds || !nodesMap || nodesMap.size === 0) return [];
  
  const buildNode = (id) => {
    const node = nodesMap.get(id);
    if (!node) return null;
    
    const children = node.childrenIds.map(buildNode).filter(Boolean);
    return { ...node, children };
  };

  return rootIds.map(buildNode).filter(Boolean);
};

/**
 * Рекурсивно фильтрует дерево узлов по поисковому запросу.
 * Узел остается в дереве, если он сам или любой из его дочерних узлов соответствует запросу.
 * @param {Array} nodes - Массив узлов для фильтрации.
 * @param {string} searchTerm - Поисковый запрос.
 * @returns {Array} - Новый массив отфильтрованных узлов.
 */
export function filterTree(nodes, searchTerm) {
  if (!nodes) return [];
  if (!searchTerm) return nodes;

  const lowercasedTerm = searchTerm.toLowerCase();

  return nodes.reduce((acc, node) => {
    const filteredChildren = filterTree(node.children || [], searchTerm);
    
    const selfMatches = 
      node.key.toString().toLowerCase().includes(lowercasedTerm) || 
      (node.value != null && node.value.toString().toLowerCase().includes(lowercasedTerm));
    
    if (selfMatches || filteredChildren.length > 0) {
      acc.push({ ...node, children: filteredChildren });
    }
    
    return acc;
  }, []);
}