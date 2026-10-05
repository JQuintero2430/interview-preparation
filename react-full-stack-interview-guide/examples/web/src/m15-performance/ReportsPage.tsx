// A "heavy" route. In a real app this module would pull in a charting library or a big table,
// which is exactly why it should live in its own chunk. `lazy` needs a default export.
export default function ReportsPage() {
  return (
    <section aria-label="Reports">
      <h2>Reports</h2>
      <p>Quarterly revenue, churn and cohort charts would render here.</p>
    </section>
  );
}
