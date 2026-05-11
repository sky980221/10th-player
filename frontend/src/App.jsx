import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import ListingsPage from './pages/ListingsPage'
import ListingDetailPage from './pages/ListingDetailPage'
import SwapRegistrationPage from './pages/SwapRegistrationPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-4">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<PrivateRoute><ListingsPage /></PrivateRoute>} />
            <Route path="/listings/:listingId" element={<PrivateRoute><ListingDetailPage /></PrivateRoute>} />
            <Route path="/swap" element={<PrivateRoute><SwapRegistrationPage /></PrivateRoute>} />
            <Route path="/chat/:listingId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}
