import { useState } from "react";
import { API_URL } from "../api";

function AddProduct({ onBack, onProductAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    unitPrice: "",
    currentStock: "",
    minimumStock: "",
    warehouseLocation: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (
      !formData.name.trim() ||
      !formData.sku.trim() ||
      !formData.category.trim() ||
      formData.unitPrice === "" ||
      formData.currentStock === "" ||
      formData.minimumStock === "" ||
      !formData.warehouseLocation.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/products`,
        {
          method: "POST",
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
          data.message || "Failed to create product"
        );
        return;
      }

      setSuccess("Product added successfully!");

      setFormData({
        name: "",
        sku: "",
        category: "",
        unitPrice: "",
        currentStock: "",
        minimumStock: "",
        warehouseLocation: "",
      });

      if (onProductAdded) {
        onProductAdded();
      }
    } catch (error) {
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Add Product</h1>
          <p>
            Add a new product to the inventory.
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
                placeholder="Enter product name"
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
                placeholder="Enter SKU"
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
                placeholder="Enter category"
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
                placeholder="Enter unit price"
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
                placeholder="Enter current stock"
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
                placeholder="Enter minimum stock"
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
                placeholder="Enter warehouse location"
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
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;