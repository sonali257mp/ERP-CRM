import { useEffect, useState } from "react";

function ViewCustomer({ customerId, onBack }) {
  const [customer, setCustomer] = useState(null);
  const [followUps, setFollowUps] = useState([]);

  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  const [error, setError] = useState("");
  const [followUpMessage, setFollowUpMessage] = useState("");

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

      setCustomer(data.customer || data);
    } catch (error) {
      setError("Unable to connect to the server");
    }
  }

  async function fetchFollowUps() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/customers/${customerId}/followups`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFollowUps(data.followUps || data);
      }
    } catch (error) {
      console.error("Failed to load follow-ups");
    }
  }

  async function loadCustomerData() {
    setLoading(true);

    await Promise.all([
      fetchCustomer(),
      fetchFollowUps(),
    ]);

    setLoading(false);
  }

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  async function handleAddFollowUp(e) {
    e.preventDefault();

    setFollowUpMessage("");
    setError("");

    if (!followUpDate || !followUpNote.trim()) {
      setFollowUpMessage(
        "Please enter both follow-up date and note."
      );
      return;
    }

    setSavingFollowUp(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/customers/${customerId}/followups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            followUpDate,
            note: followUpNote,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setFollowUpMessage(
          data.message || "Failed to add follow-up"
        );
        return;
      }

      setFollowUpDate("");
      setFollowUpNote("");

      setFollowUpMessage(
        "Follow-up added successfully!"
      );

      await fetchFollowUps();
    } catch (error) {
      setFollowUpMessage(
        "Unable to connect to the server"
      );
    } finally {
      setSavingFollowUp(false);
    }
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-message">
          Loading customer details...
        </div>
      </div>
    );
  }

  if (error && !customer) {
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

  if (!customer) {
    return (
      <div className="page-content">
        <div className="empty-message">
          Customer not found.
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
          <h1>Customer Details</h1>
          <p>
            View customer information and manage follow-ups.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={onBack}
        >
          ← Back to Customers
        </button>
      </div>

      {/* Customer information */}

      <div className="customer-details-container">
        <div className="customer-details-header">
          <div>
            <h2>{customer.name}</h2>

            <span
              className={`status-badge status-${customer.status.toLowerCase()}`}
            >
              {customer.status}
            </span>
          </div>
        </div>

        <div className="customer-details-grid">
          <div className="detail-item">
            <label>Mobile</label>
            <p>{customer.mobile || "-"}</p>
          </div>

          <div className="detail-item">
            <label>Email</label>
            <p>{customer.email || "-"}</p>
          </div>

          <div className="detail-item">
            <label>Business Name</label>
            <p>{customer.businessName || "-"}</p>
          </div>

          <div className="detail-item">
            <label>GST Number</label>
            <p>{customer.gstNumber || "-"}</p>
          </div>

          <div className="detail-item">
            <label>Customer Type</label>
            <p>{customer.customerType || "-"}</p>
          </div>

          <div className="detail-item">
            <label>Follow-up Date</label>
            <p>
              {customer.followUpDate
                ? new Date(
                    customer.followUpDate
                  ).toLocaleDateString()
                : "-"}
            </p>
          </div>

          <div className="detail-item full-width">
            <label>Address</label>
            <p>{customer.address || "-"}</p>
          </div>

          <div className="detail-item full-width">
            <label>Notes</label>
            <p>{customer.notes || "-"}</p>
          </div>
        </div>
      </div>

      {/* Add follow-up */}

      <div className="follow-up-container">
        <h2>Add Follow-up</h2>

        <form onSubmit={handleAddFollowUp}>
          <div className="follow-up-form">
            <div className="form-field">
              <label>
                Follow-up Date <span>*</span>
              </label>

              <input
                type="date"
                value={followUpDate}
                onChange={(e) =>
                  setFollowUpDate(e.target.value)
                }
                required
              />
            </div>

            <div className="form-field">
              <label>
                Note <span>*</span>
              </label>

              <input
                type="text"
                value={followUpNote}
                onChange={(e) =>
                  setFollowUpNote(e.target.value)
                }
                placeholder="Enter follow-up note"
                required
              />
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={savingFollowUp}
            >
              {savingFollowUp
                ? "Saving..."
                : "Add Follow-up"}
            </button>
          </div>
        </form>

        {followUpMessage && (
          <div className="form-success">
            {followUpMessage}
          </div>
        )}
      </div>

      {/* Follow-up history */}

      <div className="follow-up-history">
        <h2>Follow-up History</h2>

        {followUps.length === 0 ? (
          <div className="empty-message">
            No follow-ups found for this customer.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Note</th>
                  <th>Created By</th>
                </tr>
              </thead>

              <tbody>
                {followUps.map((followUp) => (
                  <tr key={followUp.id}>
                    <td>
                      {followUp.followUpDate
                        ? new Date(
                            followUp.followUpDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      {followUp.note || "-"}
                    </td>

                    <td>
                      {followUp.user?.name || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewCustomer;