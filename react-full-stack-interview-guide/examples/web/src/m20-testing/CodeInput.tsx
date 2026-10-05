import { useId, useState } from 'react';

const CODE_LENGTH = 4;

/** A 4-character code field that counts key presses, to compare fireEvent with user-event. */
export function CodeInput({ disabled = false }: { disabled?: boolean }) {
  const id = useId();
  const [value, setValue] = useState('');
  const [keyPresses, setKeyPresses] = useState(0);

  return (
    <div>
      <label htmlFor={id}>Code</label>
      <input
        id={id}
        value={value}
        maxLength={CODE_LENGTH}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={() => setKeyPresses((n) => n + 1)}
      />
      <p>Key presses: {keyPresses}</p>
    </div>
  );
}
