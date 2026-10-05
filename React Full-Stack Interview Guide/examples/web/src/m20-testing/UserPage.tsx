import { Link, useParams } from 'react-router';
import { UserProfile } from './UserProfile';

/** Route component for /users/:userId. Needs a router (for useParams and Link) and a QueryClient. */
export function UserPage() {
  const { userId } = useParams();
  if (!userId) return <p>No user selected</p>;

  return (
    <section>
      <Link to="/">All users</Link>
      <UserProfile userId={userId} />
    </section>
  );
}
