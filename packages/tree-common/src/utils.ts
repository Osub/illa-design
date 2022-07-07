import { NodeProps, TreeDataType, TreeMode } from "./interface"

export const loopNode = (
  nodeArr?: TreeDataType[],
  selectedKeys?: string[],
  mode?: TreeMode,
) => {
  if (!nodeArr) return []
  const nodeList: NodeProps[] = []
  const _loop = (nodeArr: TreeDataType[], father: NodeProps) => {
    const len = nodeArr.length
    nodeArr.forEach((node, index) => {
      const nodeProps: NodeProps & { children?: NodeProps[] } = {
        ...node,
        _checked: node._checked,
        _halfChecked: node._halfChecked,
        _isSelected: selectedKeys?.includes(node.key),
        _isSelectedChild: father._isSelected || father._isSelectedChild,
        _father: father,
        _children: node.children?.map((item) => item.key),
        _fatherPath: father?._fatherPath
          ? [...father?._fatherPath, father]
          : [father],
        _level: father?._level !== undefined ? father._level + 1 : 0,
        _isLast: index === len - 1,
        _isFirst: index === 0,
        _isFinal: false,
        _indentArr:
          father._isLast === undefined
            ? []
            : [...(father._indentArr ?? [])].concat(!father._isLast),
        _shouldMount: father.expanding && father._shouldMount,
        dataRef: node,
      }
      nodeList.push(nodeProps)
      if (node.children) {
        _loop(node.children, nodeProps)
      }
    })
  }
  _loop(nodeArr, { key: "", expanding: true, _shouldMount: true })

  // builder mode need add padding-bottom on every tree's final child
  if (mode === "builder") {
    const mountedNodeList = nodeList.filter((node) => node._shouldMount)
    for (let index = mountedNodeList.length - 1; index > 0; index--) {
      if (
        (index === mountedNodeList.length - 1 ||
          mountedNodeList[index + 1]._level === 0) &&
        mountedNodeList[index]._level !== 0
      ) {
        mountedNodeList[index]._isFinal = true
      }
    }
  }
  return nodeList
}

export const loopNodeWithState = (
  nodeArr: TreeDataType[],
  expandedKeys?: string[],
  selectedKeys?: string[],
  checkedKeys?: Set<string>,
  halfCheckedKeys?: Set<string>,
  mode?: TreeMode,
) => {
  if (!nodeArr) return []
  const _loop = (nodeArr: TreeDataType[]) => {
    nodeArr.forEach((node) => {
      if (expandedKeys) {
        node.expanding = expandedKeys?.includes(node.key)
      }
      if (checkedKeys) {
        node._checked = checkedKeys?.has(node.key)
      }
      if (halfCheckedKeys) {
        node._halfChecked = halfCheckedKeys?.has(node.key)
      }
      if (node.children) {
        _loop(node.children)
      }
    })
  }
  _loop(nodeArr)
  return loopNode(nodeArr, selectedKeys, mode)
}

export function checkChildrenChecked(
  targetKey: string,
  nodeArr?: NodeProps[],
  checkedKeys?: Set<string>,
) {
  const node = nodeArr?.find((item) => item.key === targetKey)
  const checked = checkedKeys?.has(targetKey)
  if (!node || !checkedKeys) return
  const childrenQueue = Array.from(node._children ?? [])
  while (childrenQueue.length) {
    const key = childrenQueue.pop()
    if (!key) continue
    const targetNode = nodeArr?.find((item) => item.key === key)
    if (targetNode?.disabled || targetNode?.checkable === true) continue
    if (checked) {
      checkedKeys.add(key)
    } else {
      checkedKeys.delete(key)
    }
    targetNode?._children?.map((child) => {
      childrenQueue.push(child)
    })
  }
  node?._fatherPath?.reverse().map((father, _) => {
    if (father._children?.every((childKey) => checkedKeys.has(childKey))) {
      checkedKeys.add(father.key)
    } else {
      checkedKeys.delete(father.key)
    }
  })
  return checkedKeys
}

export function checkParentChecked(
  checkedKeys: Set<string>,
  nodeArr?: NodeProps[],
) {
  const halfSet = new Set<string>()
  Array.from(checkedKeys).map((key) => {
    const item = nodeArr?.find((item) => {
      return item.key === key
    })

    item?._fatherPath?.map((father) => {
      if (father.key.length > 0) halfSet.add(father.key)
    })
  })
  return halfSet
}

export const updateKeys = (
  keys: string[],
  targetKey: string,
  multiple?: boolean,
) => {
  const hasTarget = keys?.includes(targetKey)
  if (hasTarget) {
    keys = keys?.filter((key) => key !== targetKey)
  } else {
    keys = multiple ? [...keys].concat(targetKey) : [targetKey]
  }
  return keys
}
