function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    {
      name: "Dashboard",
      icon: "📊",
    },
    {
      name: "Customers",
      icon: "👥",
    },
    {
      name: "Products",
      icon: "📦",
    },
    {
      name: "Inventory",
      icon: "📋",
    },
    {
      name: "Challans",
      icon: "🚚",
    },
    {
      name: "Follow-ups",
      icon: "📞",
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>ERP CRM</h2>
        <p>Operations Portal</p>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`menu-item ${
              activePage === item.name ? "active" : ""
            }`}
            onClick={() => setActivePage(item.name)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;