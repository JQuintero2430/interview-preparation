import { useState, type KeyboardEvent } from 'react';

export type TreeNode = { id: string; name: string; children?: TreeNode[] };
type Row = { node: TreeNode; depth: number; parentId: string | null };

/** Turn the tree into the flat list of rows that are VISIBLE (children of collapsed folders are skipped). */
export function flatten(
  nodes: TreeNode[],
  expanded: ReadonlySet<string>,
  depth = 1,
  parentId: string | null = null,
): Row[] {
  return nodes.flatMap((node) => [
    { node, depth, parentId },
    ...(node.children && expanded.has(node.id) ? flatten(node.children, expanded, depth + 1, node.id) : []),
  ]);
}

/** WAI-ARIA tree view, flat variant: every row is a treeitem with aria-level. */
export function FileTree({ nodes }: { nodes: TreeNode[] }) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState(nodes[0]?.id); // the one row in the tab order

  const rows = flatten(nodes, expanded);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  function focusRow(row: Row | undefined, tree: HTMLElement) {
    if (!row) return;
    setActiveId(row.node.id);
    // The row is already in the DOM (it is visible), so focus it now instead of waiting for a render.
    Array.from(tree.querySelectorAll<HTMLElement>('[role="treeitem"]'))
      .find((el) => el.dataset.id === row.node.id)
      ?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = rows.findIndex((r) => r.node.id === activeId);
    const row = rows[index];
    if (!row) return;
    const tree = event.currentTarget;
    const isFolder = row.node.children !== undefined;
    const isOpen = expanded.has(row.node.id);

    switch (event.key) {
      case 'ArrowDown':
        focusRow(rows[index + 1], tree);
        break;
      case 'ArrowUp':
        focusRow(rows[index - 1], tree);
        break;
      case 'Home':
        focusRow(rows[0], tree);
        break;
      case 'End':
        focusRow(rows.at(-1), tree);
        break;
      case 'ArrowRight':
        if (!isFolder) break;
        if (!isOpen) toggle(row.node.id);
        else if (rows[index + 1]?.parentId === row.node.id) focusRow(rows[index + 1], tree);
        break;
      case 'ArrowLeft':
        if (isFolder && isOpen) toggle(row.node.id);
        else focusRow(rows.find((r) => r.node.id === row.parentId), tree);
        break;
      case 'Enter':
      case ' ':
        setSelectedId(row.node.id);
        if (isFolder) toggle(row.node.id);
        break;
      default:
        return; // not ours: let the browser handle it (Tab!)
    }
    event.preventDefault();
  }

  const selected = rows.find((r) => r.node.id === selectedId);

  return (
    <div>
      <div role="tree" aria-label="Files" onKeyDown={onKeyDown}>
        {rows.map(({ node, depth }) => (
          <div
            key={node.id}
            role="treeitem"
            data-id={node.id}
            aria-level={depth}
            aria-expanded={node.children ? expanded.has(node.id) : undefined}
            aria-selected={node.id === selectedId}
            tabIndex={node.id === activeId ? 0 : -1}
            style={{ paddingLeft: `${depth * 16}px` }}
            onClick={() => {
              setActiveId(node.id);
              setSelectedId(node.id);
              if (node.children) toggle(node.id);
            }}
          >
            <span aria-hidden="true">{node.children ? (expanded.has(node.id) ? '▾ ' : '▸ ') : '· '}</span>
            {node.name}
          </div>
        ))}
      </div>
      <p role="status">{selected ? `Selected: ${selected.node.name}` : 'Nothing selected'}</p>
    </div>
  );
}
