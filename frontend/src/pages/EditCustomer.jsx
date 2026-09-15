import { useEffect, useState } from "react";

function EditCustomer({ customerId, onBack, onCustomerUpdated }) {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    businessName: "",
    gstNumber: "",
    customerType: "INDIVIDUAL",
    address: "",
    status: "LEAD",
    followUpDate: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchCustomer() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/customers/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load customer");
        return;
      }

      const customer = data.customer || data;

      setFormData({
        name: customer.name || "",
        mobile: customer.mobile || "",
        email: customer.email || "",
        businessName: customer.businessName || "",
        gstNumber: customer.gstNumber || "",
        customerType: customer.customerType || "INDIVIDUAL",
        address: customer.address || "",
        status: customer.status || "LEAD",
        followUpDate: customer.followUpDate
          ? customer.followUpDate.substring(0, 10)
          : "",
        notes: customer.notes || "",
      });
    } catch (error) {
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/customers/${customerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update customer");
        return;
      }

      if (onCustomerUpdated) {
        onCustomerUpdated();
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
          Loading customer...
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
          ← Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Edit Customer</h1>
          <p>Update customer information.</p>
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
                Name <span>*</span>
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
                Mobile <span>*</span>
              </label>

              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Business Name</label>

              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>GST Number</label>

              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Customer Type</label>

              <select
                name="customerType"
                value={formData.customerType}
                onChange={handleChange}
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="BUSINESS">Business</option>
              </select>
            </div>

            <div className="form-field">
              <label>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="form-field">
              <label>Follow-up Date</label>

              <input
                type="date"
                name="followUpDate"
                value={formData.followUpDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-field full-width">
              <label>Address</label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="form-field full-width">
              <label>Notes</label>

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
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
              onClick={onBack}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Updating..." : "Update Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCustomer;