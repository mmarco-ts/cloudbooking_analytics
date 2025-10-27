import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LiveboardPage from './pages/LiveboardPage';
import SpotterPage from './pages/SpotterPage';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LiveboardPage />} />
          <Route path="/liveboard" element={<LiveboardPage />} />
          <Route path="/spotter" element={<SpotterPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;


