import { useState } from "react";
import { API_URL } from "../api";

function AddCustomer({ onBack, onCustomerAdded }) {
  const initialFormData = {
    name: "",
    mobile: "",
    email: "",
    businessName: "",
    gstNumber: "",
    customerType: "RETAIL",
    address: "",
    status: "LEAD",
    followUpDate: "",
    notes: "",
  };

  const [formData, setFormData] = useState(initialFormData);

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

    if (!formData.name.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (!formData.mobile.trim()) {
      setError("Mobile number is required.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/customers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            mobile: formData.mobile.trim(),
            email: formData.email.trim() || undefined,
            businessName:
              formData.businessName.trim() || undefined,
            gstNumber:
              formData.gstNumber.trim() || undefined,
            customerType: formData.customerType,
            address:
              formData.address.trim() || undefined,
            status: formData.status,
            followUpDate:
              formData.followUpDate || undefined,
            notes:
              formData.notes.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to create customer"
        );
        return;
      }

      setSuccess("Customer added successfully!");

      setFormData(initialFormData);

      if (onCustomerAdded) {
        onCustomerAdded();
      }
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Add Customer</h1>
          <p>Enter customer information below.</p>
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
                placeholder="Enter customer name"
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
                placeholder="Enter mobile number"
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
                placeholder="Enter email address"
              />
            </div>

            <div className="form-field">
              <label>Business Name</label>

              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Enter business name"
              />
            </div>

            <div className="form-field">
              <label>GST Number</label>

              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                placeholder="Enter GST number"
              />
            </div>

            <div className="form-field">
              <label>Customer Type</label>

              <select
                name="customerType"
                value={formData.customerType}
                onChange={handleChange}
              >
                <option value="RETAIL">
                  Retail
                </option>

                <option value="WHOLESALE">
                  Wholesale
                </option>

                <option value="DISTRIBUTOR">
                  Distributor
                </option>
              </select>
            </div>

            <div className="form-field">
              <label>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="LEAD">
                  Lead
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
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
                placeholder="Enter customer address"
                rows="3"
              />
            </div>

            <div className="form-field full-width">
              <label>Notes</label>

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter additional notes"
                rows="3"
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
                : "Save Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCustomer;