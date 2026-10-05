import { useState, type ReactNode } from 'react';

/** A labelled input whose value lives in React state: "did the text survive?" = "did the state survive?". */
export function Field({ label }: { label: string }) {
  const [value, setValue] = useState('');
  return (
    <label>
      {label}
      <input value={value} onChange={(e) => setValue(e.target.value)} />
    </label>
  );
}

/** Same markup as Field, but a different component type. */
export function OtherField({ label }: { label: string }) {
  const [value, setValue] = useState('');
  return (
    <label>
      {label}
      <input value={value} onChange={(e) => setValue(e.target.value)} />
    </label>
  );
}

function useToggle() {
  const [on, setOn] = useState(false);
  const button = <button onClick={() => setOn((o) => !o)}>Toggle</button>;
  return [on, button] as const;
}

function Shell({ children, toggle }: { children: ReactNode; toggle: ReactNode }) {
  return (
    <div>
      {children}
      {toggle}
    </div>
  );
}

// 1. A ternary that swaps two elements of the SAME type, with different props.
export function SameTypeTernary() {
  const [on, toggle] = useToggle();
  return <Shell toggle={toggle}>{on ? <Field label="Billing" /> : <Field label="Shipping" />}</Shell>;
}

// 2. A ternary that swaps two DIFFERENT types that render identical markup.
export function DifferentTypeTernary() {
  const [on, toggle] = useToggle();
  return <Shell toggle={toggle}>{on ? <OtherField label="Name" /> : <Field label="Name" />}</Shell>;
}

// 3. The same Field, but wrapped in a <div> when the toggle is on.
export function WrapperToggle() {
  const [on, toggle] = useToggle();
  return (
    <Shell toggle={toggle}>
      {on ? (
        <div className="card">
          <Field label="Name" />
        </div>
      ) : (
        <Field label="Name" />
      )}
    </Shell>
  );
}

// 4. The same Field at the same position, but its key changes.
export function KeyToggle() {
  const [on, toggle] = useToggle();
  return (
    <Shell toggle={toggle}>
      <Field key={on ? 'b' : 'a'} label="Name" />
    </Shell>
  );
}

// 5. A conditional sibling appears BEFORE the Field.
export function ConditionalSibling() {
  const [on, toggle] = useToggle();
  return (
    <Shell toggle={toggle}>
      {on && <p>Welcome back!</p>}
      <Field label="Name" />
    </Shell>
  );
}

// 6. Two separate conditional slots, one for each state of the toggle.
export function SeparateSlots() {
  const [on, toggle] = useToggle();
  return (
    <Shell toggle={toggle}>
      {on && <Field label="Name" />}
      {!on && <Field label="Name" />}
    </Shell>
  );
}

// 7. Two different `return` statements that produce the same tree shape around the Field.
export function EarlyReturn() {
  const [on, toggle] = useToggle();
  if (on) {
    return (
      <div>
        <Field label="Name" />
        {toggle}
        <p>Now with a footer</p>
      </div>
    );
  }
  return (
    <div>
      <Field label="Name" />
      {toggle}
    </div>
  );
}

function MaybeFragment({ wrapped }: { wrapped: boolean }) {
  return wrapped ? (
    <>
      <Field label="Name" />
    </>
  ) : (
    <Field label="Name" />
  );
}

// 8. A component returns its Field either bare or inside a Fragment.
export function FragmentToggle() {
  const [on, toggle] = useToggle();
  return (
    <Shell toggle={toggle}>
      <MaybeFragment wrapped={on} />
    </Shell>
  );
}

const PEOPLE = ['Ada', 'Grace'];

// 9. A list of Fields that can be reversed, keyed by name or by index.
export function ReversibleList({ keyBy }: { keyBy: 'name' | 'index' }) {
  const [people, setPeople] = useState(PEOPLE);
  return (
    <div>
      <ul>
        {people.map((name, index) => (
          <li key={keyBy === 'name' ? name : index}>
            <Field label={name} />
          </li>
        ))}
      </ul>
      <button onClick={() => setPeople((p) => [...p].reverse())}>Reverse</button>
    </div>
  );
}
