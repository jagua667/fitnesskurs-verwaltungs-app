import { Link } from "react-router-dom";

const Sidebar = () => (
  <div className="sidebar">
    <ul>
      <li><Link to="/dashboard/admin">Admin Dashboard</Link></li>
      <li><Link to="/dashboard/trainer">Trainer Dashboard</Link></li>
      <li><Link to="/dashboard/kunde">Kunden Dashboard</Link></li>
    </ul>
  </div>
);

export default Sidebar;

