

import './Sidebar.css';

const navItems = [
  { label: 'Overview', icon: '▦' },
  { label: 'Live Map', icon: '⌖' },
  { label: 'Alerts', icon: '⚠' },
  { label: 'Shelters', icon: '⌂' },
  { label: 'Rescue Teams', icon: '🚑' },
  { label: 'Settings', icon: '⚙' },
];

function Sidebar({ activePage, onNavigate }) {
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
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`nav-item ${
              activePage === item.label ? 'active' : ''
            }`}
            type="button"
            onClick={() => onNavigate(item.label)}
            aria-current={
              activePage === item.label ? 'page' : undefined
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="online-dot" />
        <span>RESQ System</span>
        <small>{activePage}</small>
      </div>
    </aside>
  );
}

export default Sidebar;
