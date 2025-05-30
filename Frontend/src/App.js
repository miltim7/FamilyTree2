// Frontend\src\App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import FamilyTree from './components/FamilyTree';
import ArticlesPage from './components/ArticlesPage';
import ArticleView from './components/ArticleView';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<FamilyTree />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/:articleId" element={<ArticleView />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;