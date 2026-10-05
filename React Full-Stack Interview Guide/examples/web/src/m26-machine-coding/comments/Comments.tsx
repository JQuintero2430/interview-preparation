import { useRef, useState, type FormEvent } from 'react';

export type CommentData = { id: number; author: string; text: string; replies: CommentData[] };

/** Pure, immutable update of an arbitrary-depth tree: every level is copied, which is fine for a tree this size. */
export function addReply(tree: CommentData[], parentId: number, reply: CommentData): CommentData[] {
  return tree.map((node) =>
    node.id === parentId
      ? { ...node, replies: [...node.replies, reply] }
      : { ...node, replies: addReply(node.replies, parentId, reply) },
  );
}

export function countReplies(node: CommentData): number {
  return node.replies.reduce((sum, child) => sum + 1 + countReplies(child), 0);
}

type NodeProps = { comment: CommentData; onReply: (parentId: number, text: string) => void };

// UI state (collapsed, form open, draft) lives in the node; the DATA lives in the root.
function CommentNode({ comment, onReply }: NodeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState('');
  const hidden = countReplies(comment);

  function submit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onReply(comment.id, text);
    setDraft('');
    setReplying(false);
    setCollapsed(false); // show the reply that was just posted
  }

  return (
    <li>
      <p>
        <strong>{comment.author}</strong>: <span>{comment.text}</span>
      </p>
      <button type="button" aria-label={`Reply to ${comment.author}`} onClick={() => setReplying((r) => !r)}>
        Reply
      </button>
      {hidden > 0 && (
        <button
          type="button"
          aria-label={`Replies to ${comment.author}`}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? `Show ${hidden}` : 'Hide'}
        </button>
      )}
      {replying && (
        <form onSubmit={submit}>
          <input aria-label={`Your reply to ${comment.author}`} value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button type="submit">Post reply</button>
        </form>
      )}
      {!collapsed && comment.replies.length > 0 && (
        <ul>
          {comment.replies.map((child) => (
            <CommentNode key={child.id} comment={child} onReply={onReply} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function Comments({ initial }: { initial: CommentData[] }) {
  const [tree, setTree] = useState(initial);
  const nextId = useRef(1000);

  function reply(parentId: number, text: string) {
    const id = nextId.current++;
    setTree((prev) => addReply(prev, parentId, { id, author: 'You', text, replies: [] }));
  }

  return (
    <ul aria-label="Comments">
      {tree.map((comment) => (
        <CommentNode key={comment.id} comment={comment} onReply={reply} />
      ))}
    </ul>
  );
}
