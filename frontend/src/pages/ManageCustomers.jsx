import { useEffect, useState } from "react";

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  const loadCustomers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/customers");
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const deleteCustomer = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:5000/api/admin/customers/${id}`, {
        method: "DELETE",
      });

      loadCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 style={{ marginBottom: 5 }}>Customer Management</h1>

      <p style={{ color: "#666", marginBottom: 25 }}>
        Total Customers : <strong>{customers.length}</strong>
      </p>

      <input
        type="text"
        placeholder="Search customer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "320px",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "15px",
        }}
      />

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 5px 12px rgba(0,0,0,.08)",
        }}
      >
        <div className="portal-table-wrap">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead
              style={{
                background: "#e85d04",
                color: "white",
              }}
            >
              <tr>
                <th style={th}>ID</th>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={th}>Phone</th>
                <th style={th}>Joined</th>
                <th style={th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td style={td}>{customer.id}</td>
                  <td style={td}>{customer.name}</td>
                  <td style={td}>{customer.email}</td>
                  <td style={td}>{customer.phone}</td>
                  <td style={td}>
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>

                  <td style={td}>
                    <button
                      onClick={() => deleteCustomer(customer.id)}
                      style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: 30,
                      color: "#666",
                    }}
                  >
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const th = {
  padding: "14px",
  textAlign: "left",
};

const td = {
  padding: "14px",
  borderBottom: "1px solid #eee",
};