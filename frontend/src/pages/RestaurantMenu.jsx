import { useEffect, useState } from "react";

export default function RestaurantMenu() {
  const restaurant = JSON.parse(sessionStorage.getItem("restaurant"));
  console.log("Restaurant ID:", restaurant.id);
  console.log("Restaurant Object:", JSON.stringify(restaurant, null, 2));

  const [menu, setMenu] = useState([]);
  const [showForm, setShowForm] = useState(false);

const [form, setForm] = useState({
  name: "",
  description: "",
  category: "",
  price: "",
  image_url: "",
});


  const loadMenu = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/restaurants/menu/${restaurant.id}`
      );

      const data = await res.json();

      setMenu(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const addMenuItem = async () => {
  try {
    const res = await fetch(
      "http://localhost:5000/api/restaurants/menu",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          ...form,
        }),
      }
    );

    const data = await res.json();

    if (data.success) {
      alert("Menu item added successfully!");

      setForm({
        name: "",
        description: "",
        category: "",
        price: "",
        image_url: "",
      });

      setShowForm(false);

      loadMenu();
    } else {
      alert("Failed to add item.");
    }
  } catch (err) {
    console.error(err);
    alert("Server error.");
  }
};

const deleteItem = async (id) => {

  const ok = window.confirm("Delete this menu item?");

  if (!ok) return;

  try {

    await fetch(
      `http://localhost:5000/api/restaurants/menu/${id}`,
      {
        method: "DELETE",
      }
    );

    loadMenu();

  } catch (err) {
    console.error(err);
  }
};

const editItem = async (item) => {

  const name = prompt("Food Name", item.name);
  if (name === null) return;

  const description = prompt("Description", item.description);
  if (description === null) return;

  const category = prompt("Category", item.category);
  if (category === null) return;

  const price = prompt("Price", item.price);
  if (price === null) return;

  const image_url = prompt("Image URL", item.image_url || "");

  try {

    await fetch(
      `http://localhost:5000/api/restaurants/menu/${item.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          category,
          price,
          image_url,
        }),
      }
    );

    loadMenu();

  } catch (err) {
    console.error(err);
  }
};

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 25,
        }}
      >
        <h2>🍽 Menu Items</h2>

<button
  className="btn btn-primary"
  onClick={() => setShowForm(!showForm)}
>
  + Add Item
</button>
      </div>

      {showForm && (
        <div
          style={{
            background: "#f8f9fa",
            padding: 20,
            marginBottom: 25,
            borderRadius: 12,
          }}
        >
          <h3>Add Menu Item</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch("http://localhost:5000/api/restaurants/menu", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    ...form,
                    restaurant_id: restaurant.id,
                  }),
                });
                const data = await res.json();
                if (data.success) {
                  loadMenu();
                  setForm({
                    name: "",
                    description: "",
                    category: "",
                    price: "",
                    image_url: "",
                  });
                  setShowForm(false);
                }
              } catch (err) {
                console.error(err);
              }
            }}
          >
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                className="form-control"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                className="form-control"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                className="form-control"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="image_url">Image URL</label>
              <input
                type="text"
                id="image_url"
                className="form-control"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-success">
              Add Item
            </button>
          </form>
        </div>
      )}

      {showForm && (
  <div
    style={{
      background: "#fff",
      padding: 20,
      borderRadius: 10,
      marginBottom: 25,
      boxShadow: "0 4px 10px rgba(0,0,0,.08)",
    }}
  >
    <h3>Add New Menu Item</h3>

    <input
      type="text"
      placeholder="Food Name"
      value={form.name}
      onChange={(e) =>
        setForm({ ...form, name: e.target.value })
      }
      style={input}
    />

    <textarea
      placeholder="Description"
      value={form.description}
      onChange={(e) =>
        setForm({ ...form, description: e.target.value })
      }
      style={input}
    />

    <input
      type="text"
      placeholder="Category"
      value={form.category}
      onChange={(e) =>
        setForm({ ...form, category: e.target.value })
      }
      style={input}
    />

    <input
      type="number"
      placeholder="Price"
      value={form.price}
      onChange={(e) =>
        setForm({ ...form, price: e.target.value })
      }
      style={input}
    />

    <input
      type="text"
      placeholder="Image URL (optional)"
      value={form.image_url}
      onChange={(e) =>
        setForm({ ...form, image_url: e.target.value })
      }
      style={input}
    />

    <button
      className="btn btn-primary"
      onClick={addMenuItem}
    >
      Save Item
    </button>
  </div>
)}

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
              <th style={th}>Food</th>
              <th style={th}>Category</th>
              <th style={th}>Price</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {menu.map((item, index) => (
              <tr key={item.id}>
                <td style={td}>{index + 1}</td>

                <td style={td}>{item.name}</td>

                <td style={td}>{item.category}</td>

                <td style={td}>NPR {item.price}</td>

                <td style={td}>
                <button
                  style={editBtn}
                  onClick={() => editItem(item)}
                >
                  Edit
                </button>

                <button
                  style={deleteBtn}
                  onClick={() => deleteItem(item.id)}
                >
                  Delete
                </button>
                </td>
              </tr>
            ))}

            {menu.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: 30,
                    color: "#777",
                  }}
                >
                  No menu items found.
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

const editBtn = {
  background: "#0d6efd",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: 6,
  cursor: "pointer",
  marginRight: 8,
};

const deleteBtn = {
  background: "#dc3545",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: 6,
  cursor: "pointer",
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 12,
  border: "1px solid #ccc",
  borderRadius: 6,
  boxSizing: "border-box",
};