import { describe, expect, it } from "vitest"
import { TreeStore } from "../../src/core/TreeStore"
import { demoItems, type DemoTreeItem } from "../../src/data/mockItems"

describe("TreeStore", () => {
  it("returns initial array from getAll", () => {
    const store = new TreeStore(demoItems)
    expect(store.getAll()).toEqual(demoItems)
  });

  it("returns item by id for string and number ids", () => {
    const store = new TreeStore(demoItems)
    expect(store.getItem(1)?.label).toBe("Айтем 1")
    expect(store.getItem("91064cee")?.label).toBe("Айтем 2")
  });

  it("returns direct children only", () => {
    const store = new TreeStore(demoItems)
    const children = store.getChildren("91064cee")
    expect(children.map((item) => item.id)).toEqual([4, 5, 6])
  });

  it("returns all descendants by depth", () => {
    const store = new TreeStore(demoItems)
    const allChildren = store.getAllChildren("91064cee");
    expect(allChildren.map((item) => item.id)).toEqual([4, 7, 8, 5, 6])
  });

  it("returns parent chain in strict order", () => {
    const store = new TreeStore(demoItems)
    const parentChain = store.getAllParents(7)
    expect(parentChain.map((item) => item.id)).toEqual([7, 4, "91064cee", 1])
  });

  it("adds new item", () => {
    const store = new TreeStore([...demoItems])
    const item: DemoTreeItem = { id: "new", parent: 4, label: "Новый" }
    store.addItem(item)

    expect(store.getItem("new")).toEqual(item)
    expect(store.getChildren(4).map((child) => child.id)).toContain("new")
  });

  it("updates item data and parent references", () => {
    const store = new TreeStore([...demoItems])
    store.updateItem({ id: 8, parent: 3, label: "Айтем 8 (обновлен)" })

    expect(store.getItem(8)?.label).toBe("Айтем 8 (обновлен)")
    expect(store.getChildren(4).map((item) => item.id)).not.toContain(8)
    expect(store.getChildren(3).map((item) => item.id)).toContain(8)
  });

  it("removes item with all descendants", () => {
    const store = new TreeStore([...demoItems])
    store.removeItem("91064cee")

    expect(store.getItem("91064cee")).toBeUndefined()
    expect(store.getItem(4)).toBeUndefined()
    expect(store.getItem(7)).toBeUndefined()
    expect(store.getAll().map((item) => item.id)).toEqual([1, 3])
  });

  it("throws on duplicate id in constructor", () => {
    expect(
      () =>
        new TreeStore([
          ...demoItems,
          { id: 1, parent: null, label: "Дубликат" } as DemoTreeItem,
        ]),
    ).toThrowError(/Duplicate id/);
  });

  it("throws on add/update/remove unknown ids", () => {
    const store = new TreeStore([...demoItems]);
    expect(() =>
      store.addItem({ id: 1, parent: null, label: "Дубликат" }),
    ).toThrowError(/already exists/);
    expect(() =>
      store.updateItem({ id: "missing", parent: null, label: "missing" }),
    ).toThrowError(/does not exist/)
    expect(() => store.removeItem("missing")).toThrowError(/does not exist/)
  });
});
