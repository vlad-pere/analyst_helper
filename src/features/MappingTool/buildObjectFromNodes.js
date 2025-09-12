export const buildObjectFromNodes = (rootIds, nodesMap) => {
    if (!rootIds || rootIds.length === 0 || !nodesMap || nodesMap.size === 0) {
        // Определяем, что вернуть по умолчанию. Если есть ноды, но нет рутов, это пустой объект.
        // Если нод нет вообще, может быть null или пустой объект. Пустой объект безопаснее.
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
                    // Для массивов ключ не важен, элементы идут по порядку
                    if (Array.isArray(container)) {
                        container.push(buildNodeValue(childId));
                    } else {
                        container[childNode.key] = buildNodeValue(childId);
                    }
                }
            }
            return container;
        }
        return node.value;
    };
    
    // Определяем, является ли корень массивом или объектом
    // Проверяем ключ первого корневого узла. Если это число, считаем, что это массив.
    const firstRootNode = nodesMap.get(rootIds[0]);
    const isRootArray = firstRootNode && !isNaN(parseInt(firstRootNode.key, 10));
    
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

    // Если у нас был всего один корневой элемент с ключом "value" (обертка для примитивов),
    // возвращаем его значение напрямую.
    if (!isRootArray && rootIds.length === 1 && firstRootNode.key === 'value' && firstRootNode.childrenIds.length === 0) {
        return firstRootNode.value;
    }

    return result;
};