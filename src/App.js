import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Componets/HomePage.js';
import PageComponent from './Componets/Main.js'

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/page" element={<PageComponent />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
