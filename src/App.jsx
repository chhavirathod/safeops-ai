import { useState } from 'react'
import LoadingScreen from './components/Loadingscreen'
import CustomCursor from './components/Customcursor'
import Navbar from './components/Navbar'
import HeroSection from './components/Herosection'
import ProblemSection from './components/Problemsection'
import SolutionSection from './components/Solutionsection'
import DigitalTwinSection from './components/Digitaltwinsection'
import { FeaturesSection, AnalyticsSection, CTASection, Footer } from './components/Sections'
import { AnimatePresence, motion } from 'framer-motion'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      <CustomCursor />

      <AnimatePresence>
        {!loaded && (
          <LoadingScreen onComplete={() => setLoaded(true)} />
        )}
      </AnimatePresence>

      {loaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Navbar />
          <main>
            <HeroSection />
            <ProblemSection />
            <SolutionSection />
            <DigitalTwinSection />
            <FeaturesSection />
            <AnalyticsSection />
            <CTASection />
          </main>
          <Footer />
        </motion.div>
      )}
    </>
  )
}