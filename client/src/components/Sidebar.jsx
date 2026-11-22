
import './Sidebar.css';

const navItems = [
  { label: 'Overview', icon: '▦' },
  { label: 'Live Map', icon: '⌖' },
  { label: 'Alerts', icon: '⚠' },
  { label: 'Shelters', icon: '⌂' },
  { label: 'Settings', icon: '⚙' },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">R</div>
        <div>
          <h2>RESQ</h2>
          <span>Emergency Response</span>
        </div>
      </div>

      <p className="sidebar-label">WORKSPACE</p>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => (
          <button
            key={item.label}
            className={`nav-item ${index === 0 ? 'active' : ''}`}
            type="button"
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="online-dot" />
        <span>RESQ System</span>
        <small>Dashboard</small>
      </div>
    </aside>
  );
}

export default Sidebar;
