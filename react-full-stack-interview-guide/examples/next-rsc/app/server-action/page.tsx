import { SignupForm } from './SignupForm';

// The page is a Server Component with no request-time API, so the build prints "○ /server-action" (Static).
// The Server Function behind the form is a separate POST endpoint; having one does not make the page dynamic.
export default function ServerActionPage() {
  return (
    <main>
      <h1>Sign up (Server Function + useActionState)</h1>
      <SignupForm />
    </main>
  );
}
