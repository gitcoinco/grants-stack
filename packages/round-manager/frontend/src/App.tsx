import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
import { Link } from "react-router-dom";

import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Counter />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <span>
          <Link to="/test">Test Route 1</Link>
        </span>
      </header>
    </div>
  );
}

export default App;
