import { describe, expect, it, vi } from "vitest"
import { defineComponent } from "vue"
import { mount } from "@vue/test-utils"
import TreeGrid from "../../src/components/TreeGrid.vue"
import { demoItems } from "../../src/data/mockItems"

vi.mock("ag-grid-vue3", () => ({
  AgGridVue: defineComponent({
    name: "AgGridVue",
    props: {
      rowData: {
        type: Array,
        default: () => [],
      },
      columnDefs: {
        type: Array,
        default: () => [],
      },
      treeData: Boolean,
      groupDefaultExpanded: Number,
    },
    template: "<div class='ag-grid-stub' />",
  }),
}));

describe("TreeGrid", () => {
  it("passes correctly prepared rowData to AgGrid", () => {
    const wrapper = mount(TreeGrid, {
      props: {
        items: demoItems,
      },
    })

    const grid = wrapper.findComponent({ name: "AgGridVue" })
    const rowData = grid.props("rowData") as Array<{ id: string | number; path: string[] }>
    expect(rowData).toHaveLength(8)
    expect(rowData.find((row) => row.id === 7)?.path).toEqual([
      "1",
      "91064cee",
      "4",
      "7",
    ]);
  });

  it("computes category as group or element", () => {
    const wrapper = mount(TreeGrid, {
      props: {
        items: demoItems,
      },
    });

    const grid = wrapper.findComponent({ name: "AgGridVue" })
    const columnDefs = grid.props("columnDefs") as Array<{
      headerName?: string;
      valueGetter?: (params: { data?: { id: string | number } }) => string;
    }>

    const categoryColumn = columnDefs.find((column) => column.headerName === "Категория")
    expect(categoryColumn?.valueGetter?.({ data: { id: 4 } })).toBe("Группа")
    expect(categoryColumn?.valueGetter?.({ data: { id: 7 } })).toBe("Элемент")
  });
});
