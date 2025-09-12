// src/features/MappingTool/utils/buildObjectFromNodes.js

export const buildObjectFromNodes = (rootIds, nodesMap) => {
    if (!rootIds || rootIds.length === 0 || !nodesMap || nodesMap.size === 0) {
        return {};
    }

    const buildNodeValue = (id) => {
        const node = nodesMap.get(id);
        if (!node) return undefined;
        
        if (node.childrenIds && node.childrenIds.length > 0) {
            const container = node.type === 'array' ? [] : {};
            for (const childId of node.childrenIds) {
                const childNode = nodesMap.get(childId);
                if (childNode) {
                    if (Array.isArray(container)) {
                        container.push(buildNodeValue(childId));
                    } else {
                        container[childNode.key] = buildNodeValue(childId);
                    }
                }
            }
            return container;
        }
        
        switch (node.type) {
            case 'string':
                return String(node.value);
            case 'number':
                // Пытаемся преобразовать в число, если не получается - оставляем как есть (или 0)
                const num = Number(node.value);
                return isNaN(num) ? node.value : num;
            case 'boolean':
                return String(node.value).toLowerCase() === 'true';
            case 'null':
                return null;
            default:
                return node.value;
        }
    };
    
    const firstRootNode = nodesMap.get(rootIds[0]);
    
    if (!firstRootNode) return {};

    // Если у нас был всего один корневой элемент-примитив (обертка), возвращаем его значение
    if (rootIds.length === 1 && firstRootNode.key === 'value' && firstRootNode.childrenIds.length === 0) {
        return buildNodeValue(firstRootNode.id);
    }
    
    const isRootArray = !isNaN(parseInt(firstRootNode.key, 10));
    const result = isRootArray ? [] : {};
    
    for (const rootId of rootIds) {
        const rootNode = nodesMap.get(rootId);
        if (rootNode) {
             if (isRootArray) {
                result.push(buildNodeValue(rootId));
             } else {
                result[rootNode.key] = buildNodeValue(rootId);
             }
        }
    }

    return result;
};