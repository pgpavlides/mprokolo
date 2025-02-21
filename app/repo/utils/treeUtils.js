export const generateTreeText = (treeData) => {
    const buildTree = (items, prefix = "") => {
      let result = "";
      items.forEach((item, index, array) => {
        const isLast = index === array.length - 1;
        const connector = isLast ? "└── " : "├── ";
        const itemPrefix = prefix + connector;
        const childPrefix = prefix + (isLast ? "    " : "│   ");
  
        result += `${itemPrefix}${item.path.split("/").pop()}\n`;
  
        if (item.type === "tree") {
          const children = treeData.filter(
            (child) =>
              child.path.startsWith(item.path + "/") &&
              child.path.split("/").length === item.path.split("/").length + 1
          );
          result += buildTree(children, childPrefix);
        }
      });
      return result;
    };
  
    const rootItems = treeData.filter((item) => !item.path.includes("/"));
    return buildTree(rootItems);
  };