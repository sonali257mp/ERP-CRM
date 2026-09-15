import { useEffect, useState } from "react";

function ViewProduct({ productId, onBack }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchProduct() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to load product"
        );
        return;
      }

      setProduct(data.product || data);
    } catch (error) {
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-message">
          Loading product details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <div className="error-message">
          {error}
        </div>

        <button
          className="secondary-button"
          onClick={onBack}
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-content">
        <div className="empty-message">
          Product not found.
        </div>

        <button
          className="secondary-button"
          onClick={onBack}
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Product Details</h1>
          <p>
            View complete product information.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={onBack}
        >
          ← Back to Products
        </button>
      </div>

      <div className="customer-details-container">
        <div className="customer-details-header">
          <div>
            <h2>{product.name}</h2>

            <span className="status-badge status-active">
              Product
            </span>
          </div>
        </div>

        <div className="customer-details-grid">

          <div className="detail-item">
            <label>Product Name</label>
            <p>{product.name || "-"}</p>
          </div>

          <div className="detail-item">
            <label>SKU</label>
            <p>{product.sku || "-"}</p>
          </div>

          <div className="detail-item">
            <label>Category</label>
            <p>{product.category || "-"}</p>
          </div>

          <div className="detail-item">
            <label>Unit Price</label>
            <p>
              ₹{product.unitPrice ?? 0}
            </p>
          </div>

          <div className="detail-item">
            <label>Current Stock</label>
            <p>
              {product.currentStock ?? 0}
            </p>
          </div>

          <div className="detail-item">
            <label>Minimum Stock</label>
            <p>
              {product.minimumStock ?? 0}
            </p>
          </div>

          <div className="detail-item full-width">
            <label>Warehouse Location</label>
            <p>
              {product.warehouseLocation || "-"}
            </p>
          </div>

          <div className="detail-item">
            <label>Created At</label>
            <p>
              {product.createdAt
                ? new Date(
                    product.createdAt
                  ).toLocaleDateString()
                : "-"}
            </p>
          </div>

          <div className="detail-item">
            <label>Last Updated</label>
            <p>
              {product.updatedAt
                ? new Date(
                    product.updatedAt
                  ).toLocaleDateString()
                : "-"}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ViewProduct;