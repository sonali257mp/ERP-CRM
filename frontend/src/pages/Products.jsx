import { useEffect, useState } from "react";
import AddProduct from "./AddProduct";
import ViewProduct from "./ViewProduct";
import EditProduct from "./EditProduct";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [viewProductId, setViewProductId] = useState(null);
  const [editProductId, setEditProductId] = useState(null);

  async function fetchProducts(searchValue = "") {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const url = searchValue
        ? `http://localhost:5000/products?search=${encodeURIComponent(
            searchValue
          )}`
        : "http://localhost:5000/products";

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to load products"
        );
        return;
      }

      setProducts(data.products || data);
    } catch (error) {
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchProducts(search);
  }

  function handleProductAdded() {
    setShowAddProduct(false);
    fetchProducts();
  }

  async function handleDeleteProduct(productId) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5000/products/${productId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(
        data.message || "Failed to delete product"
      );
      return;
    }

    fetchProducts();
   } catch (error) {
    alert("Unable to connect to the server");
   }
  }

  if (viewProductId) {
    return (
      <ViewProduct
        productId={viewProductId}
        onBack={() => setViewProductId(null)}
      />
    );
  }

  if (editProductId) {
    return (
      <EditProduct
        productId={editProductId}
        onBack={() => setEditProductId(null)}
        onProductUpdated={() => {
          setEditProductId(null);
          fetchProducts();
        }}
      />
    );
  }

  if (showAddProduct) {
    return (
      <AddProduct
        onBack={() => setShowAddProduct(false)}
        onProductAdded={handleProductAdded}
      />
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>
            Manage products and inventory information.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowAddProduct(true)}
        >
          + Add Product
        </button>
      </div>

      <div className="customer-toolbar">
        <form
          onSubmit={handleSearch}
          className="search-form"
        >
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button
            type="submit"
            className="secondary-button"
          >
            Search
          </button>
        </form>
      </div>

      {loading && (
        <div className="loading-message">
          Loading products...
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="table-container">
          {products.length === 0 ? (
            <div className="empty-message">
              No products found.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Current Stock</th>
                  <th>Minimum Stock</th>
                  <th>Warehouse</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>

                    <td>
                      {product.sku || "-"}
                    </td>

                    <td>
                      {product.category || "-"}
                    </td>

                    <td>
                      ₹{product.unitPrice}
                    </td>

                    <td>
                      {product.currentStock ?? 0}
                    </td>

                    <td>
                      {product.minimumStock ?? 0}
                    </td>

                    <td>
                      {product.warehouseLocation ||
                        "-"}
                    </td>

                    <td>
                       <button
                          className="table-action"
                          onClick={() =>
                           setViewProductId(product.id)
                          }
                        >
                          View
                        </button>

                        <button
                          className="table-action"
                          onClick={() =>
                            setEditProductId(product.id)
                          }
                        >
                          Edit
                        </button>

  <button
    className="table-action"
    onClick={() =>
      handleDeleteProduct(product.id)
    }
  >
    Delete
  </button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default Products;