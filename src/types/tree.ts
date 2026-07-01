export type TreeId = string | number

export interface TreeItem {
  id: TreeId,
  parent: TreeId | null,
  [key: string]: unknown,
}
