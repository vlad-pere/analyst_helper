// --- START OF FILE src/features/MappingTool/utils/flattenJsonTree.js ---

/**
 * Рекурсивно "сглаживает" иерархическое дерево JSON в плоский массив
 * для удобного отображения в таблице.
 * @param {Array} nodes - Массив узлов дерева (например, sourceJsonData).
 * @returns {Array} - Плоский массив узлов.
 */
export function flattenJsonTree(nodes) {
  let flatList = [];
  function traverse(nodeArray) {
    if (!nodeArray) return;
    for (const node of nodeArray) {
      flatList.push(node);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }
  traverse(nodes);
  return flatList;
}