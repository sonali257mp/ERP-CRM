import { useEffect, useState } from "react";

function EditProduct({ productId, onBack, onProductUpdated }) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    unitPrice: "",
    currentStock: "",
    minimumStock: "",
    warehouseLocation: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

      const product = data.product || data;

      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        category: product.category || "",
        unitPrice: product.unitPrice ?? "",
        currentStock: product.currentStock ?? "",
        minimumStock: product.minimumStock ?? "",
        warehouseLocation:
          product.warehouseLocation || "",
      });
    } catch (error) {
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            sku: formData.sku.trim(),
            category: formData.category.trim(),
            unitPrice: Number(formData.unitPrice),
            currentStock: Number(formData.currentStock),
            minimumStock: Number(formData.minimumStock),
            warehouseLocation:
              formData.warehouseLocation.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to update product"
        );
        return;
      }

      setSuccess("Product updated successfully!");

      if (onProductUpdated) {
        onProductUpdated();
      }
    } catch (error) {
      setError("Unable to connect to the server");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-message">
          Loading product...
        </div>
      </div>
    );
  }

  if (error && !formData.name) {
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

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Edit Product</h1>
          <p>
            Update the product information.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={onBack}
        >
          ← Back
        </button>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            <div className="form-field">
              <label>
                Product Name <span>*</span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>
                SKU <span>*</span>
              </label>

              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>
                Category <span>*</span>
              </label>

              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>
                Unit Price <span>*</span>
              </label>

              <input
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-field">
              <label>
                Current Stock <span>*</span>
              </label>

              <input
                type="number"
                name="currentStock"
                value={formData.currentStock}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-field">
              <label>
                Minimum Stock <span>*</span>
              </label>

              <input
                type="number"
                name="minimumStock"
                value={formData.minimumStock}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-field full-width">
              <label>
                Warehouse Location <span>*</span>
              </label>

              <input
                type="text"
                name="warehouseLocation"
                value={formData.warehouseLocation}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {success && (
            <div className="form-success">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onBack}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Updating..."
                : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;