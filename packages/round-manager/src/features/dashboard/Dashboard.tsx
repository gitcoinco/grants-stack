import { Link } from "react-router-dom";

import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Round Manager</h1>
        <span>
          <Link to="/round/new">New Round</Link> <br/>
          <Link to="/round/XYZ">Round XYZ</Link> <br/>
        </span>
      </header>
    </div>
  );
}