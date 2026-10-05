import { NavLink, Outlet, Route, Routes, useParams } from 'react-router';

/** A layout route: renders the shared chrome once, and the matched child in <Outlet />. */
function Shell() {
  return (
    <>
      <nav aria-label="Main">
        <NavLink to="/" end>
          Home
        </NavLink>{' '}
        <NavLink to="/users/1">Ada</NavLink> <NavLink to="/users/2">Alan</NavLink>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}

function UserDetail() {
  // Params are strings (or undefined): parse and validate them like any untrusted input.
  const { userId } = useParams();
  return <h1>User {userId}</h1>;
}

/** Declarative mode: routes are JSX, matched during render. No loaders, actions or fetchers. */
export function DeclarativeApp() {
  return (
    <Routes>
      <Route path="/" element={<Shell />}>
        <Route index element={<h1>Home</h1>} />
        <Route path="users/:userId" element={<UserDetail />} />
        <Route path="*" element={<h1>Page not found</h1>} />
      </Route>
    </Routes>
  );
}
