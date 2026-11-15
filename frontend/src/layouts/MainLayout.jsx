import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import { useCinema } from '../context/CinemaContext';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    currentUser,
    logout,
    showToast,
    notification,
    isGiftCardOpen,
    setIsGiftCardOpen,
    isOffersOpen,
    setIsOffersOpen,
    isTrailerOpen,
    setIsTrailerOpen,
    selectedTrailerId
  } = useCinema();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/catalog') return 'catalog';
    if (path.startsWith('/tickets')) return 'tickets';
    if (path.startsWith('/cinemas')) return 'cinemas';
    return '';
  };

  const getSubNavCategory = () => {
    const path = location.pathname;
    if (path.startsWith('/cinemas')) return 'cinemas';
    if (path === '/catalog') return 'now-showing';
    return '';
  };

  const handleSubNavSelect = (id) => {
    if (id === 'gift-cards') {
      setIsGiftCardOpen(true);
    } else if (id === 'offers') {
      setIsOffersOpen(true);
    } else if (id === 'trailers') {
      setIsTrailerOpen(true);
    } else if (id === 'cinemas') {
      navigate('/cinemas');
    } else if (id === 'now-showing') {
      navigate('/catalog');
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0e] text-[#ede9e3] flex flex-col font-sans selection:bg-[#e5a93c] selection:text-[#090a0e] w-full">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#171b24] text-[#ede9e3] border border-[#e5a93c]/50 font-medium text-xs shadow-2xl shadow-black/80 flex items-center space-x-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#e5a93c]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Navbar */}
      <TopNavbar
        activeTab={getActiveTab()}
        setActiveTab={(tab) => {
          if (tab === 'home') navigate('/');
          else if (tab === 'catalog') navigate('/catalog');
          else if (tab === 'tickets') navigate('/tickets');
          else if (tab === 'cinemas') navigate('/cinemas');
        }}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (q && location.pathname !== '/catalog') {
            navigate('/catalog');
          }
        }}
        currentUser={currentUser}
        onOpenAuth={() => navigate('/auth')}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full px-2 sm:px-3 lg:px-4 py-2 flex flex-col">

        {/* Dynamic Nested Routes (Catalog, Movie Details, Tickets, Cinemas) */}
        <Outlet />
      </main>





    </div>
  );
}

