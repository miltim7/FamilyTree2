// Frontend\src\App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import FamilyTree from './components/FamilyTree';
import ArticlesPage from './components/ArticlesPage';
import ArticleView from './components/ArticleView';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import './App.css';

function AppContent() {
  const location = useLocation();
  
  // Показываем Hero блок только на главной странице
  const showHero = location.pathname === '/';

  return (
    <div className="App">
      <Navigation />
      {showHero && <Hero />}
      <Routes>
        <Route path="/" element={<FamilyTree />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:articleId" element={<ArticleView />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;