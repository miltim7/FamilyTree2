// Frontend\src\utils\familyUtils.js

// Функция для получения дефолтной фотографии по полу
export const getDefaultPhoto = (gender) => {
  if (gender === 'female') {
    return '/assets/default_female.jpg';
  } else if (gender === 'male') {
    return '/assets/default_male.jpg';
  }
  // Для неопределенного пола возвращаем мужскую по умолчанию
  return '/assets/default_male.jpg';
};

// Функция поиска персоны по ID
export const findPersonById = (root, id) => {
  if (!root || !id) return null;
  
  const normalizedId = id.replace(/-spouse$/, '');
  
  if (root.id === normalizedId) {
    return root;
  }
  
  if (root.children && Array.isArray(root.children)) {
    for (let i = 0; i < root.children.length; i++) {
      const child = root.children[i];
      if (!child) continue;
      
      const found = findPersonById(child, normalizedId);
      if (found) return found;
    }
  }
  
  return null;
};

// Функция поиска прямых предков персоны (родители, дедушки, бабушки...)
export const findDirectAncestors = (familyData, personId, ancestors = new Set()) => {
  if (!personId || ancestors.has(personId)) return ancestors;
  
  ancestors.add(personId);
  
  // Найти родителя этого человека
  const findParent = (node, targetId) => {
    if (!node || !node.children) return null;
    
    for (const child of node.children) {
      if (!child) continue;
      if (child.id === targetId) return node;
      
      const found = findParent(child, targetId);
      if (found) return found;
    }
    return null;
  };
  
  const parent = findParent(familyData, personId);
  if (parent) {
    findDirectAncestors(familyData, parent.id, ancestors);
  }
  
  return ancestors;
};

// Функция поиска прямых потомков персоны (дети, внуки, правнуки...)
export const findDirectDescendants = (familyData, personId, descendants = new Set()) => {
  if (!personId || descendants.has(personId)) return descendants;
  
  descendants.add(personId);
  
  const person = findPersonById(familyData, personId);
  if (person && person.children) {
    for (const child of person.children) {
      if (!child) continue;
      findDirectDescendants(familyData, child.id, descendants);
    }
  }
  
  return descendants;
};

// Функция поиска братьев и сестер (дети тех же родителей)
export const findSiblings = (familyData, personId) => {
  const siblings = new Set();
  
  // Найти родителя
  const findParent = (node, targetId) => {
    if (!node || !node.children) return null;
    
    for (const child of node.children) {
      if (!child) continue;
      if (child.id === targetId) return node;
      
      const found = findParent(child, targetId);
      if (found) return found;
    }
    return null;
  };
  
  const parent = findParent(familyData, personId);
  if (parent && parent.children) {
    // Добавить всех детей этого родителя (включая самого человека)
    for (const child of parent.children) {
      if (child) {
        siblings.add(child.id);
      }
    }
  }
  
  return siblings;
};

// Функция получения ТОЛЬКО близких кровных родственников
export const getBloodRelatives = (familyData, personId) => {
  if (!personId) return new Set();
  
  const relatives = new Set();
  
  // 1. Добавляем самого человека
  relatives.add(personId);
  
  // 2. Добавляем прямых предков (родители, дедушки, бабушки...)
  const ancestors = findDirectAncestors(familyData, personId);
  ancestors.forEach(id => relatives.add(id));
  
  // 3. Добавляем прямых потомков (дети, внуки, правнуки...)
  const descendants = findDirectDescendants(familyData, personId);
  descendants.forEach(id => relatives.add(id));
  
  // 4. Добавляем братьев и сестер
  const siblings = findSiblings(familyData, personId);
  siblings.forEach(id => relatives.add(id));
  
  // 5. Добавляем потомков братьев и сестер (племянники, племянницы)
  siblings.forEach(siblingId => {
    if (siblingId !== personId) { // Не обрабатываем самого себя повторно
      const siblingDescendants = findDirectDescendants(familyData, siblingId);
      siblingDescendants.forEach(id => relatives.add(id));
    }
  });
  
  return relatives;
};

// Функция добавления супруга
export const addSpouseToFamily = (familyData, targetPersonId, spouseData) => {
  const newFamilyData = JSON.parse(JSON.stringify(familyData));
  
  const addSpouseToNode = (node) => {
    if (!node) return false;
    
    if (node.id === targetPersonId) {
      if (node.spouse) {
        return { success: false, message: "У этой персоны уже есть супруг(-а)" };
      }
      
      node.spouse = { ...spouseData };
      return { success: true };
    }
    
    if (node.children && Array.isArray(node.children)) {
      for (let child of node.children) {
        if (!child) continue;
        
        const result = addSpouseToNode(child);
        if (result.success !== undefined) {
          return result;
        }
      }
    }
    
    return false;
  };
  
  const result = addSpouseToNode(newFamilyData);
  
  if (result.success) {
    return { success: true, data: newFamilyData };
  } else if (result.message) {
    return { success: false, message: result.message };
  } else {
    return { success: false, message: "Не удалось найти персону для добавления супруга" };
  }
};

// Функция добавления ребенка
export const addChildToFamily = (familyData, parentId, childData) => {
  const childId = `child-${Date.now()}`;
  
  const newChild = {
    id: childId,
    ...childData,
    spouse: null,
    children: []
  };
  
  const newFamilyData = JSON.parse(JSON.stringify(familyData));
  
  const addChildToParent = (node) => {
    if (!node) return false;
    
    if (node.id === parentId) {
      if (!node.children) {
        node.children = [];
      }
      
      node.children.push({...newChild});
      return true;
    }
    
    if (node.children && Array.isArray(node.children)) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (!child) continue;
        
        if (addChildToParent(child)) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  const success = addChildToParent(newFamilyData);
  
  if (success) {
    return { success: true, data: newFamilyData };
  } else {
    return { success: false, message: "Родитель не найден" };
  }
};