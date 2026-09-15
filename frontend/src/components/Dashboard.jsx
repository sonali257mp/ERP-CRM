function Dashboard({ user }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user.name}</p>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-icon">👥</div>
          <div>
            <h3>Customers</h3>
            <p>Manage your customers</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📦</div>
          <div>
            <h3>Products</h3>
            <p>Manage products</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📋</div>
          <div>
            <h3>Inventory</h3>
            <p>Track stock movements</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">🚚</div>
          <div>
            <h3>Challans</h3>
            <p>Manage delivery challans</p>
          </div>
        </div>
      </div>

      <div className="dashboard-welcome">
        <h2>ERP & CRM Operations Portal</h2>
        <p>
          Use the navigation menu to manage customers, products,
          inventory, challans and follow-ups.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;