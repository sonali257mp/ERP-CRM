import { useEffect, useState } from "react";
import { API_URL } from "../api";

function Inventory() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showMovementForm, setShowMovementForm] =
    useState(false);

  const [movementType, setMovementType] =
    useState("IN");

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const [saving, setSaving] = useState(false);

  async function fetchInventory() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        productsResponse,
        movementsResponse,
      ] = await Promise.all([
        fetch(
          `${API_URL}/products`,
          {
            headers,
          }
        ),

        fetch(
          `${API_URL}/stock-movements`,
          {
            headers,
          }
        ),
      ]);

      const productsData =
        await productsResponse.json();

      const movementsData =
        await movementsResponse.json();

      if (!productsResponse.ok) {
        throw new Error(
          productsData.message ||
            "Failed to load products"
        );
      }

      if (!movementsResponse.ok) {
        throw new Error(
          movementsData.message ||
            "Failed to load stock movements"
        );
      }

      setProducts(
        productsData.products ||
          productsData
      );

      setMovements(
        movementsData.movements ||
          movementsData
      );
    } catch (error) {
      console.error(
        "Inventory loading error:",
        error
      );

      setError(
        error.message ||
          "Unable to connect to the server"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, []);

  async function handleMovementSubmit(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!productId) {
      setError("Please select a product.");
      return;
    }

    if (!quantity) {
      setError("Please enter a quantity.");
      return;
    }

    if (Number(quantity) <= 0) {
      setError(
        "Quantity must be greater than zero."
      );
      return;
    }

    if (!Number.isInteger(Number(quantity))) {
      setError(
        "Quantity must be a whole number."
      );
      return;
    }

    if (!reason.trim()) {
      setError("Please enter a reason.");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/stock-movements`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            productId: Number(productId),
            quantity: Number(quantity),
            type: movementType,
            reason: reason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to record stock movement"
        );
        return;
      }

      setMessage(
        "Stock movement recorded successfully."
      );

      setProductId("");
      setQuantity("");
      setReason("");
      setMovementType("IN");
      setShowMovementForm(false);

      await fetchInventory();
    } catch (error) {
      console.error(
        "Stock movement error:",
        error
      );

      setError(
        "Unable to connect to the server"
      );
    } finally {
      setSaving(false);
    }
  }

  function getProductName(productId) {
    const product = products.find(
      (item) =>
        item.id === Number(productId)
    );

    return product
      ? product.name
      : "-";
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Inventory</h1>

          <p>
            Manage stock and track inventory
            movements.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setShowMovementForm(
              !showMovementForm
            );

            setError("");
            setMessage("");
          }}
        >
          {showMovementForm
            ? "Close"
            : "+ Stock Movement"}
        </button>
      </div>

      {message && (
        <div className="form-success">
          {message}
        </div>
      )}

      {showMovementForm && (
        <div className="form-container">
          <h2>
            Record Stock Movement
          </h2>

          <form
            onSubmit={
              handleMovementSubmit
            }
          >
            <div className="form-grid">
              <div className="form-field">
                <label>
                  Movement Type{" "}
                  <span>*</span>
                </label>

                <select
                  value={movementType}
                  onChange={(e) =>
                    setMovementType(
                      e.target.value
                    )
                  }
                >
                  <option value="IN">
                    Stock IN
                  </option>

                  <option value="OUT">
                    Stock OUT
                  </option>
                </select>
              </div>

              <div className="form-field">
                <label>
                  Product <span>*</span>
                </label>

                <select
                  value={productId}
                  onChange={(e) =>
                    setProductId(
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Select Product
                  </option>

                  {products.map(
                    (product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name} -{" "}
                        {product.sku}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-field">
                <label>
                  Quantity <span>*</span>
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      e.target.value
                    )
                  }
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div className="form-field full-width">
                <label>
                  Reason <span>*</span>
                </label>

                <input
                  type="text"
                  value={reason}
                  onChange={(e) =>
                    setReason(
                      e.target.value
                    )
                  }
                  placeholder="Enter reason for movement"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowMovementForm(
                    false
                  );

                  setError("");
                  setMessage("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Record Movement"}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && !showMovementForm && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-message">
          Loading inventory...
        </div>
      ) : (
        <>
          {/* CURRENT STOCK */}

          <div className="table-container">
            <h2>Current Stock</h2>

            {products.length === 0 ? (
              <div className="empty-message">
                No products found.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Minimum Stock</th>
                    <th>Warehouse</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map(
                    (product) => {
                      const isLowStock =
                        Number(
                          product.currentStock
                        ) <=
                        Number(
                          product.minimumStock
                        );

                      return (
                        <tr
                          key={
                            product.id
                          }
                        >
                          <td>
                            {product.name}
                          </td>

                          <td>
                            {product.sku ||
                              "-"}
                          </td>

                          <td>
                            {product.category ||
                              "-"}
                          </td>

                          <td>
                            {
                              product.currentStock
                            }
                          </td>

                          <td>
                            {
                              product.minimumStock
                            }
                          </td>

                          <td>
                            {product.warehouseLocation ||
                              "-"}
                          </td>

                          <td>
                            {isLowStock ? (
                              <span className="status-badge status-inactive">
                                Low Stock
                              </span>
                            ) : (
                              <span className="status-badge status-active">
                                Available
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* STOCK MOVEMENT HISTORY */}

          <div className="table-container">
            <h2>
              Stock Movement History
            </h2>

            {movements.length === 0 ? (
              <div className="empty-message">
                No stock movements found.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {movements.map(
                    (movement) => (
                      <tr
                        key={
                          movement.id
                        }
                      >
                        <td>
                          {movement.createdAt
                            ? new Date(
                                movement.createdAt
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>
                          {movement.product
                            ?.name ||
                            getProductName(
                              movement.productId
                            )}
                        </td>

                        <td>
                          <span className="status-badge">
                            {movement.type}
                          </span>
                        </td>

                        <td>
                          {
                            movement.quantity
                          }
                        </td>

                        <td>
                          {movement.reason ||
                            "-"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Inventory;