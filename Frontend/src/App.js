// Frontend\src\App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FamilyTree from './components/FamilyTree';
import ArticlesPage from './components/ArticlesPage';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<FamilyTree />} />
          <Route path="/articles" element={<ArticlesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;