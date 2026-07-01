<script setup lang="ts">
import { computed } from "vue"
import { AgGridVue } from "ag-grid-vue3"
import type { ColDef, GetDataPath, ValueGetterParams } from "ag-grid-community"
import { TreeStore } from "../core/TreeStore"
import type { DemoTreeItem } from "../data/mockItems"

interface TreeGridRow extends DemoTreeItem {
  path: string[]
}

const props = defineProps<{
  items: DemoTreeItem[]
}>()

const treeStore = computed(() => new TreeStore(props.items))
const isGroupRow = (id: string | number): boolean =>
  treeStore.value.getChildren(id).length > 0

const rowData = computed<TreeGridRow[]>(() =>
  treeStore.value.getAll().map((item) => ({
    ...item,
    path: treeStore.value
      .getAllParents(item.id)
      .reverse()
      .map((parentItem) => String(parentItem.id)),
  })),
)

const columnDefs: ColDef<TreeGridRow>[] = [
  {
    headerName: "№ п/п",
    maxWidth: 100,
    valueGetter: (params: ValueGetterParams<TreeGridRow>) =>
      (params.node?.rowIndex ?? 0) + 1,
  },
  {
    colId: "category",
    headerName: "Категория",
    showRowGroup: true,
    cellRenderer: "agGroupCellRenderer",
    cellRendererParams: {
      suppressCount: true,
    },
    cellClassRules: {
      "group-cell-bold": (params) => {
        const currentId = params.data?.id
        return currentId !== undefined && isGroupRow(currentId)
      },
    },
    valueGetter: (params: ValueGetterParams<TreeGridRow>) => {
      const currentId = params.data?.id
      if (currentId === undefined) {
        return ""
      }
      return isGroupRow(currentId) ? "Группа" : "Элемент"
    },
  },
  {
    colId: "name",
    headerName: "Наименование",
    minWidth: 260,
    field: "label",
    cellClassRules: {
      "group-cell-bold": (params) => {
        const currentId = params.data?.id
        return currentId !== undefined && isGroupRow(currentId)
      },
    },
  },
]

const defaultColDef: ColDef<TreeGridRow> = {
  sortable: false,
  suppressHeaderMenuButton: true,
}

const getDataPath: GetDataPath<TreeGridRow> = (data) => data.path
</script>

<template>
  <ag-grid-vue
    class="ag-theme-quartz tree-grid"
    :row-data="rowData"
    :column-defs="columnDefs"
    :default-col-def="defaultColDef"
    :tree-data="true"
    :group-display-type="'custom'"
    :group-suppress-auto-column="true"
    :group-default-expanded="0"
    :get-data-path="getDataPath"
    :animate-rows="true"
  />
</template>

<style scoped>
.tree-grid {
  width: 100%;
  height: 70vh;
  --ag-row-group-indent-size: 12px;
}

.tree-grid :deep(.group-cell-bold) {
  font-weight: 700;
}

.tree-grid :deep(.ag-header-cell-resize::after) {
  height: 100%;
  top: 0;
}

.ag-cell-value ag-cell ag-cell-not-inline-editing ag-cell-normal-height  {
  font-weight: 700;
}
</style>