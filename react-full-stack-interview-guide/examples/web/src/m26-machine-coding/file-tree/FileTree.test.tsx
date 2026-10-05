import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileTree, flatten, type TreeNode } from './FileTree';

const nodes: TreeNode[] = [
  {
    id: 'src',
    name: 'src',
    children: [
      { id: 'components', name: 'components', children: [{ id: 'button', name: 'Button.tsx' }] },
      { id: 'app', name: 'App.tsx' },
    ],
  },
  { id: 'readme', name: 'README.md' },
];

test('flatten skips the children of collapsed folders and records depth and parent', () => {
  expect(flatten(nodes, new Set()).map((r) => r.node.id)).toEqual(['src', 'readme']);

  const rows = flatten(nodes, new Set(['src', 'components']));
  expect(rows.map((r) => [r.node.id, r.depth, r.parentId])).toEqual([
    ['src', 1, null],
    ['components', 2, 'src'],
    ['button', 3, 'components'],
    ['app', 2, 'src'],
    ['readme', 1, null],
  ]);
});

test('folders start collapsed and a click expands and collapses them', async () => {
  const user = userEvent.setup();
  render(<FileTree nodes={nodes} />);
  const src = screen.getByRole('treeitem', { name: 'src' });
  expect(src).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('treeitem', { name: 'App.tsx' })).not.toBeInTheDocument();

  await user.click(src);
  expect(src).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('treeitem', { name: 'App.tsx' })).toHaveAttribute('aria-level', '2');

  await user.click(src);
  expect(screen.queryByRole('treeitem', { name: 'App.tsx' })).not.toBeInTheDocument();
});

test('files are selectable and have no aria-expanded', async () => {
  const user = userEvent.setup();
  render(<FileTree nodes={nodes} />);
  await user.click(screen.getByRole('treeitem', { name: 'README.md' }));
  expect(screen.getByRole('treeitem', { name: 'README.md' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('treeitem', { name: 'README.md' })).not.toHaveAttribute('aria-expanded');
  expect(screen.getByRole('status')).toHaveTextContent('Selected: README.md');
});

test('keyboard: the tree is one tab stop; arrows, expand/collapse, Home and End', async () => {
  const user = userEvent.setup();
  render(<FileTree nodes={nodes} />);

  await user.tab();
  expect(screen.getByRole('treeitem', { name: 'src' })).toHaveFocus();

  await user.keyboard('{ArrowRight}'); // expand
  expect(screen.getByRole('treeitem', { name: 'components' })).toBeInTheDocument();
  await user.keyboard('{ArrowRight}'); // already open: go to first child
  expect(screen.getByRole('treeitem', { name: 'components' })).toHaveFocus();

  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('treeitem', { name: 'App.tsx' })).toHaveFocus();
  await user.keyboard('{ArrowLeft}'); // a file: go to the parent
  expect(screen.getByRole('treeitem', { name: 'src' })).toHaveFocus();
  await user.keyboard('{ArrowLeft}'); // open folder: collapse
  expect(screen.queryByRole('treeitem', { name: 'App.tsx' })).not.toBeInTheDocument();

  await user.keyboard('{End}');
  expect(screen.getByRole('treeitem', { name: 'README.md' })).toHaveFocus();
  await user.keyboard('{Home}');
  expect(screen.getByRole('treeitem', { name: 'src' })).toHaveFocus();
});

test('Enter selects and toggles a folder', async () => {
  const user = userEvent.setup();
  render(<FileTree nodes={nodes} />);
  await user.tab();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('treeitem', { name: 'src' })).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('status')).toHaveTextContent('Selected: src');
});
