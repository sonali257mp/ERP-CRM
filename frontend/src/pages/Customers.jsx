import { useEffect, useState } from "react";
import AddCustomer from "./AddCustomer";
import ViewCustomer from "./ViewCustomer";
import EditCustomer from "./EditCustomer";
import { API_URL } from "../api";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [editCustomerId, setEditCustomerId] = useState(null);

  async function fetchCustomers(searchValue = "") {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const url = searchValue
        ? `${API_URL}/customers?search=${encodeURIComponent(
            searchValue
          )}`
        : `${API_URL}/customers`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load customers");
        return;
      }

      setCustomers(data.customers || data);
    } catch (error) {
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchCustomers(search);
  }

  function handleCustomerAdded() {
    setShowAddCustomer(false);
    fetchCustomers();
  }

  /*
    If Add Customer button is clicked,
    show the Add Customer page instead of the customer list.
  */
  if (showAddCustomer) {
    return (
      <AddCustomer
        onBack={() => setShowAddCustomer(false)}
        onCustomerAdded={handleCustomerAdded}
      />
    );
  }

  if (selectedCustomerId) {
    return (
      <ViewCustomer
        customerId={selectedCustomerId}
        onBack={() => setSelectedCustomerId(null)}
      />
    );
  }

  if (editCustomerId) {
    return (
      <EditCustomer
        customerId={editCustomerId}
        onBack={() => setEditCustomerId(null)}
        onCustomerUpdated={() => {
          setEditCustomerId(null);
          fetchCustomers();
        }}
      />
    );
  }



  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage customer information and follow-ups.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowAddCustomer(true)}
        >
          + Add Customer
        </button>
      </div>

      <div className="customer-toolbar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by name, mobile or business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button type="submit" className="secondary-button">
            Search
          </button>
        </form>
      </div>

      {loading && (
        <div className="loading-message">
          Loading customers...
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="table-container">
          {customers.length === 0 ? (
            <div className="empty-message">
              No customers found.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Business</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>

                    <td>{customer.mobile}</td>

                    <td>
                      {customer.businessName || "-"}
                    </td>

                    <td>
                      {customer.customerType}
                    </td>

                    <td>
                      <span
                        className={`status-badge status-${customer.status.toLowerCase()}`}
                      >
                        {customer.status}
                      </span>
                    </td>

                    <td>
                      <button
                       className="table-action"
                       onClick={() => setSelectedCustomerId(customer.id)}
                      >
                       View
                      </button>

                      <button
                        className="table-action"
                        onClick={() => setEditCustomerId(customer.id)}
                      >
                        Edit
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

export default Customers;