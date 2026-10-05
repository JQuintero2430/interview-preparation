import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { describeError, fieldErrors } from './problem';
import type { ProjectsApi } from './projectsApi';

/** Creates a project; a 400 problem+json with `errors` becomes an inline message on the field. */
export function NewProjectForm({ api }: { api: ProjectsApi }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const mutation = useMutation({
    mutationFn: (value: string) => api.create(value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
  const nameError = fieldErrors(mutation.error)['name'];
  const otherError = mutation.isError && !nameError ? describeError(mutation.error) : null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(name, { onSuccess: () => setName('') });
      }}
    >
      <label htmlFor="project-name">Name</label>
      <input
        id="project-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-invalid={nameError ? true : undefined}
        aria-describedby={nameError ? 'project-name-error' : undefined}
      />
      {nameError && (
        <p id="project-name-error" role="alert">
          {nameError}
        </p>
      )}
      {otherError && <p role="alert">{otherError}</p>}
      <button type="submit" disabled={mutation.isPending}>
        Create
      </button>
      {mutation.isSuccess && <p role="status">Created {mutation.data.project.name} at {mutation.data.location}</p>}
    </form>
  );
}
