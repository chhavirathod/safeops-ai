import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import LoadingScreen from './components/Loadingscreen'
import CustomCursor from './components/Customcursor'
import Navbar from './components/Navbar'
import HeroSection from './components/Herosection'
import ProblemSection from './components/Problemsection'
import SolutionSection from './components/Solutionsection'
import { FeaturesSection, CTASection, Footer } from './components/Sections'
import LoginPage from './pages/LoginPage'
import DashboardPage from './dashboard/DashboardPage'
import ProtectedRoute from './ProtectedRoute'
import { AnimatePresence, motion } from 'framer-motion'

function HomePage() {
  const [loaded, setLoaded] = useState(false)
  return (
    <>
      <CustomCursor />
      <AnimatePresence>
        {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      </AnimatePresence>
      {loaded && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <Navbar />
          <main>
            <HeroSection />
            <ProblemSection />
            <SolutionSection />
            <FeaturesSection />
            <CTASection />
          </main>
          <Footer />
        </motion.div>
      )}
    </>
  )
}
 
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}