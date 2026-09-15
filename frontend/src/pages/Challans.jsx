import { useEffect, useState } from "react";
import { API_URL } from "../api";

function Challans() {
  const [challans, setChallans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([
    {
      productId: "",
      quantity: 1,
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchData() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        challansResponse,
        customersResponse,
        productsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/challans`, {
          headers,
        }),

        fetch(`${API_URL}/customers`, {
          headers,
        }),

        fetch(`${API_URL}/products`, {
          headers,
        }),
      ]);

      const challansData =
        await challansResponse.json();

      const customersData =
        await customersResponse.json();

      const productsData =
        await productsResponse.json();

      if (!challansResponse.ok) {
        throw new Error(
          challansData.message ||
            "Failed to load challans"
        );
      }

      if (!customersResponse.ok) {
        throw new Error(
          customersData.message ||
            "Failed to load customers"
        );
      }

      if (!productsResponse.ok) {
        throw new Error(
          productsData.message ||
            "Failed to load products"
        );
      }

      setChallans(
        challansData.challans ||
          challansData
      );

      setCustomers(
        customersData.customers ||
          customersData
      );

      setProducts(
        productsData.products ||
          productsData
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to connect to the server"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function addProductRow() {
    setItems([
      ...items,
      {
        productId: "",
        quantity: 1,
      },
    ]);
  }

  function removeProductRow(index) {
    if (items.length === 1) {
      return;
    }

    setItems(
      items.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  }

  function updateItem(
    index,
    field,
    value
  ) {
    const updatedItems = [...items];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    setItems(updatedItems);
  }

  function resetForm() {
    setCustomerId("");

    setItems([
      {
        productId: "",
        quantity: 1,
      },
    ]);

    setMessage("");
    setError("");
  }

  async function handleSubmit(
    status
  ) {
    setMessage("");
    setError("");

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (items.length === 0) {
      setError(
        "Please add at least one product."
      );
      return;
    }

    const hasInvalidItem = items.some(
      (item) =>
        !item.productId ||
        Number(item.quantity) <= 0
    );

    if (hasInvalidItem) {
      setError(
        "Please select a product and enter a valid quantity for every row."
      );
      return;
    }

    const productIds = items.map(
      (item) => item.productId
    );

    if (
      new Set(productIds).size !==
      productIds.length
    ) {
      setError(
        "The same product cannot be added more than once."
      );
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/challans`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerId: Number(customerId),
            status,
            items: items.map((item) => ({
              productId: Number(
                item.productId
              ),
              quantity: Number(
                item.quantity
              ),
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to create challan"
        );
        return;
      }

      setMessage(
        status === "CONFIRMED"
          ? "Challan confirmed successfully!"
          : "Challan saved as draft successfully!"
      );

      resetForm();
      setShowForm(false);

      await fetchData();
    } catch (error) {
      setError(
        "Unable to connect to the server"
      );
    } finally {
      setSaving(false);
    }
  }

  function getCustomerName(challan) {
    if (challan.customer) {
      return (
        challan.customer.businessName ||
        challan.customer.name ||
        "-"
      );
    }

    return "-";
  }

  async function handleCancel(challanId) {
  const confirmed = window.confirm(
    "Are you sure you want to cancel this challan?"
  );

  if (!confirmed) {
    return;
  }

  setMessage("");
  setError("");

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/challans/${challanId}/cancel`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(
        data.message ||
          "Failed to cancel challan"
      );
      return;
    }

    setMessage(
      "Challan cancelled successfully."
    );

    await fetchData();
  } catch (error) {
    setError(
      "Unable to connect to the server"
    );
  }
}

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Sales Challans</h1>

          <p>
            Create and manage sales challans.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setShowForm(!showForm);
            setMessage("");
            setError("");
          }}
        >
          {showForm
            ? "Close"
            : "+ New Challan"}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>Create Sales Challan</h2>

          <div className="form-field">
            <label>
              Customer <span>*</span>
            </label>

            <select
              value={customerId}
              onChange={(e) =>
                setCustomerId(e.target.value)
              }
            >
              <option value="">
                Select Customer
              </option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.businessName ||
                    customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="challan-items-section">
            <div className="section-header">
              <h3>Products</h3>

              <button
                type="button"
                className="secondary-button"
                onClick={addProductRow}
              >
                + Add Product
              </button>
            </div>

            {items.map(
              (item, index) => (
                <div
                  className="challan-item-row"
                  key={index}
                >
                  <div className="form-field">
                    <label>
                      Product{" "}
                      <span>*</span>
                    </label>

                    <select
                      value={
                        item.productId
                      }
                      onChange={(e) =>
                        updateItem(
                          index,
                          "productId",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Product
                      </option>

                      {products.map(
                        (product) => (
                          <option
                            key={product.id}
                            value={
                              product.id
                            }
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
                      Quantity{" "}
                      <span>*</span>
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        item.quantity
                      }
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() =>
                      removeProductRow(
                        index
                      )
                    }
                    disabled={
                      items.length === 1
                    }
                  >
                    Remove
                  </button>
                </div>
              )
            )}
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {message && (
            <div className="form-success">
              {message}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="secondary-button"
              disabled={saving}
              onClick={() =>
                handleSubmit("DRAFT")
              }
            >
              {saving
                ? "Saving..."
                : "Save Draft"}
            </button>

            <button
              type="button"
              className="primary-button"
              disabled={saving}
              onClick={() =>
                handleSubmit("CONFIRMED")
              }
            >
              {saving
                ? "Saving..."
                : "Confirm Challan"}
            </button>
          </div>
        </div>
      )}

      {error && !showForm && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-message">
          Loading challans...
        </div>
      ) : (
        <div className="table-container">
          <h2>Challan History</h2>

          {challans.length === 0 ? (
            <div className="empty-message">
              No challans found.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Challan Number</th>
                  <th>Customer</th>
                  <th>Total Quantity</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {challans.map(
                  (challan) => (
                    <tr
                      key={challan.id}
                    >
                      <td>
                        {
                          challan.challanNumber
                        }
                      </td>

                      <td>
                        {getCustomerName(
                          challan
                        )}
                      </td>

                      <td>
                        {
                          challan.totalQuantity
                        }
                      </td>

                      <td>
                        <span className="status-badge">
                          {challan.status}
                        </span>
                      </td>

                      <td>
                        {challan.createdAt
                          ? new Date(
                              challan.createdAt
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        {challan.status !== "CANCELLED" && (
                          <button
                            className="danger-button"
                            onClick={() =>
                              handleCancel(challan.id)
                            }
                          >
                            Cancel
                          </button>
                        )}
                      </td>

                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default Challans;