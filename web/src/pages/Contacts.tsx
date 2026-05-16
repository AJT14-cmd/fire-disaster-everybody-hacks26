export function Contacts() {
  const contacts = [
    { name: "Sam Rivera", phone: "+1 555-0101" },
    { name: "Morgan Lee", phone: "+1 555-0102" }
  ];

  return (
    <div className="page">
      <h1>Emergency Contacts</h1>
      {contacts.map((c) => (
        <div key={c.phone} className="panel">
          <strong>{c.name}</strong>
          <p className="muted">{c.phone}</p>
        </div>
      ))}
      <p className="muted">Update contacts via profile API (coming soon in UI).</p>
    </div>
  );
}
