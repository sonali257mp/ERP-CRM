import { useEffect, useState } from "react";

function FollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function fetchData() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const followUpsResponse = await fetch(
        "http://localhost:5000/customers/followups",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const followUpsData =
        await followUpsResponse.json();

      if (!followUpsResponse.ok) {
        setError(
          followUpsData.message ||
            "Failed to load follow-ups"
        );
        return;
      }

      setFollowUps(followUpsData);

      const customersResponse = await fetch(
        "http://localhost:5000/customers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const customersData =
        await customersResponse.json();

      if (customersResponse.ok) {
        setCustomers(
          customersData.customers ||
            customersData
        );
      }
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!customerId || !followUpDate || !note.trim()) {
      setMessage(
        "Please fill in all follow-up fields."
      );
      return;
    }

    setSaving(true);

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
            note: note.trim(),
            followUpDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to add follow-up"
        );
        return;
      }

      setMessage(
        "Follow-up added successfully!"
      );

      setCustomerId("");
      setFollowUpDate("");
      setNote("");

      setShowForm(false);

      await fetchData();
    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to connect to the server"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Follow-ups</h1>
          <p>
            Track customer follow-up activities.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            setShowForm(!showForm)
          }
        >
          {showForm
            ? "Close"
            : "+ Add Follow-up"}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>Add Follow-up</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">

              <div className="form-field">
                <label>
                  Customer <span>*</span>
                </label>

                <select
                  value={customerId}
                  onChange={(e) =>
                    setCustomerId(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Select Customer
                  </option>

                  {customers.map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

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

              <div className="form-field full-width">
                <label>
                  Note <span>*</span>
                </label>

                <textarea
                  value={note}
                  onChange={(e) =>
                    setNote(e.target.value)
                  }
                  placeholder="Enter follow-up note"
                  rows="3"
                  required
                />
              </div>

            </div>

            {message && (
              <div className="form-success">
                {message}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowForm(false)
                }
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
                  : "Save Follow-up"}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-message">
          Loading follow-ups...
        </div>
      ) : (
        <div className="table-container">
          {followUps.length === 0 ? (
            <div className="empty-message">
              No follow-ups found.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Follow-up Date</th>
                  <th>Note</th>
                  <th>Created By</th>
                </tr>
              </thead>

              <tbody>
                {followUps.map((followUp) => (
                  <tr key={followUp.id}>
                    <td>
                      {followUp.customer?.name ||
                        "-"}
                    </td>

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
          )}
        </div>
      )}
    </div>
  );
}

export default FollowUps;