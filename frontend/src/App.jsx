import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CinemaProvider } from './context/CinemaContext';
import MainLayout from './layouts/MainLayout';
import LandingHomePage from './components/LandingHomePage';
import CatalogPage from './pages/CatalogPage';
import MovieDetailPage from './components/MovieDetailPage';
import TicketsView from './components/TicketsView';
import CinemasView from './components/CinemasView';
import AuthPage from './components/AuthPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <CinemaProvider>
        <Routes>
          {/* Dedicated Full-Screen Landing Page */}
          <Route path="/" element={<LandingHomePage />} />

          {/* Dedicated Full-Screen Authentication Page */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Dedicated Full-Screen Cinema Admin Operations Console */}
          <Route path="/admin" element={<AdminPage />} />

          {/* Main Cinema Views wrapped with TopNavbar, SubNav & Global Modals */}
          <Route element={<MainLayout />}>
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/movie/:id" element={<MovieDetailPage />} />
            <Route path="/tickets" element={<TicketsView />} />
            <Route path="/cinemas" element={<CinemasView />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CinemaProvider>
    </BrowserRouter>
  );
}
