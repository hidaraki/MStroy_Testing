import type { TreeId, TreeItem } from "../types/tree";

type ParentId = TreeId | null;

export class TreeStore<T extends TreeItem> {
  private readonly items: T[];
  private readonly idToItem = new Map<TreeId, T>();
  private readonly idToParent = new Map<TreeId, ParentId>();
  private readonly parentToChildren = new Map<ParentId, TreeId[]>();
  private readonly idToIndex = new Map<TreeId, number>();

  constructor(items: T[]) {
    this.items = [...items];
    this.buildIndexes();
  }

  getAll(): T[] {
    return this.items;
  }

  getItem(id: TreeId): T | undefined {
    return this.idToItem.get(id);
  }

  getChildren(id: TreeId): T[] {
    const childrenIds = this.parentToChildren.get(id);
    if (!childrenIds || childrenIds.length === 0) {
      return [];
    }

    const children: T[] = [];
    for (const childId of childrenIds) {
      const child = this.idToItem.get(childId);
      if (child) {
        children.push(child);
      }
    }
    return children;
  }

  getAllChildren(id: TreeId): T[] {
    const result: T[] = [];
    const stack: TreeId[] = [];
    const rootChildren = this.parentToChildren.get(id) ?? [];
    for (let i = rootChildren.length - 1; i >= 0; i -= 1) {
      stack.push(rootChildren[i]);
    }

    while (stack.length > 0) {
      const currentId = stack.pop();
      if (currentId === undefined) {
        continue;
      }

      const currentItem = this.idToItem.get(currentId);
      if (!currentItem) {
        continue;
      }

      result.push(currentItem);
      const nestedChildren = this.parentToChildren.get(currentId);
      if (nestedChildren && nestedChildren.length > 0) {
        for (let i = nestedChildren.length - 1; i >= 0; i -= 1) {
          stack.push(nestedChildren[i]);
        }
      }
    }

    return result;
  }

  getAllParents(id: TreeId): T[] {
    const result: T[] = [];
    let currentId: ParentId = id;

    while (currentId !== null) {
      const item = this.idToItem.get(currentId);
      if (!item) {
        break;
      }
      result.push(item);
      currentId = this.idToParent.get(currentId) ?? null;
    }

    return result;
  }

  addItem(item: T): void {
    if (this.idToItem.has(item.id)) {
      throw new Error(`Item with id "${String(item.id)}" already exists.`);
    }

    this.items.push(item);
    this.idToItem.set(item.id, item);
    this.idToParent.set(item.id, item.parent);
    this.idToIndex.set(item.id, this.items.length - 1);
    this.addChildReference(item.parent, item.id);
  }

  updateItem(item: T): void {
    const existingItem = this.idToItem.get(item.id);
    if (!existingItem) {
      throw new Error(`Item with id "${String(item.id)}" does not exist.`);
    }

    const oldParent = this.idToParent.get(item.id) ?? null;
    const newParent = item.parent;

    if (oldParent !== newParent) {
      this.removeChildReference(oldParent, item.id);
      this.addChildReference(newParent, item.id);
      this.idToParent.set(item.id, newParent);
    }

    this.idToItem.set(item.id, item);
    const existingIndex = this.idToIndex.get(item.id);
    if (existingIndex !== undefined) {
      this.items[existingIndex] = item;
    }
  }

  removeItem(id: TreeId): void {
    if (!this.idToItem.has(id)) {
      throw new Error(`Item with id "${String(id)}" does not exist.`);
    }

    const idsToDelete = new Set<TreeId>([id]);
    const descendants = this.getAllChildren(id);
    for (const descendant of descendants) {
      idsToDelete.add(descendant.id);
    }

    const directParent = this.idToParent.get(id) ?? null;
    this.removeChildReference(directParent, id);

    for (const itemId of idsToDelete) {
      this.idToItem.delete(itemId);
      this.idToParent.delete(itemId);
      this.parentToChildren.delete(itemId);
      this.idToIndex.delete(itemId);
    }

    const nextItems = this.items.filter((item) => !idsToDelete.has(item.id));
    this.items.length = 0;
    this.items.push(...nextItems);
    this.rebuildIndicesAfterRemoval();
  }

  private buildIndexes(): void {
    this.idToItem.clear();
    this.idToParent.clear();
    this.parentToChildren.clear();
    this.idToIndex.clear();

    for (let index = 0; index < this.items.length; index += 1) {
      const item = this.items[index];
      if (this.idToItem.has(item.id)) {
        throw new Error(`Duplicate id "${String(item.id)}" found.`);
      }

      this.idToItem.set(item.id, item);
      this.idToParent.set(item.id, item.parent);
      this.idToIndex.set(item.id, index);
      this.addChildReference(item.parent, item.id);
    }
  }

  private addChildReference(parent: ParentId, childId: TreeId): void {
    const children = this.parentToChildren.get(parent);
    if (children) {
      children.push(childId);
      return;
    }
    this.parentToChildren.set(parent, [childId]);
  }

  private removeChildReference(parent: ParentId, childId: TreeId): void {
    const siblings = this.parentToChildren.get(parent);
    if (!siblings || siblings.length === 0) {
      return;
    }

    const index = siblings.indexOf(childId);
    if (index === -1) {
      return;
    }

    siblings.splice(index, 1);
    if (siblings.length === 0) {
      this.parentToChildren.delete(parent);
    }
  }

  private rebuildIndicesAfterRemoval(): void {
    this.idToIndex.clear();
    for (let index = 0; index < this.items.length; index += 1) {
      this.idToIndex.set(this.items[index].id, index);
    }
  }
}