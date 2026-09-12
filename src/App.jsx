import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { HomeView } from './components/HomeView'
import { ProfessionalsView } from './components/ProfessionalsView'
import { ProfileDetailView } from './components/ProfileDetailView'
import { RegisterView } from './components/RegisterView'
import { DashboardView } from './components/DashboardView'
import { Footer } from './components/Footer'
import { fetchProfiles } from './services/profiles'

export default function App() {
  const [currentView, setView] = useState('home')
  const [profiles, setProfiles] = useState([])
  const [selectedProfessional, setSelectedProfessional] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState(null)

  useEffect(() => {
    loadProfiles(categoryFilter)
  }, [categoryFilter])

  const loadProfiles = async (category = null) => {
    const data = await fetchProfiles(category)
    setProfiles(data)
  }

  const handleSelectCategory = (catName) => {
    setCategoryFilter(catName)
    setView('profissionais')
  }

  const handleSelectProfessional = (prof) => {
    setSelectedProfessional(prof)
    setView('perfil')
  }

  // Função para navegar e rolar até à secção desejada
  const handleNavigateSection = (sectionId) => {
    if (currentView !== 'home') {
      setView('home')
      setTimeout(() => {
        const el = document.getElementById(sectionId)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 150)
    } else {
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col justify-between">
      <div>
        <Navbar 
          currentView={currentView} 
          setView={setView} 
          onNavigateSection={handleNavigateSection}
        />

        <main>
          {currentView === 'home' && (
            <HomeView 
              profiles={profiles} 
              onSelectCategory={handleSelectCategory}
              onSelectProfessional={handleSelectProfessional}
              setView={setView}
            />
          )}

          {currentView === 'profissionais' && (
            <ProfessionalsView 
              profiles={profiles}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              onSelectProfessional={handleSelectProfessional}
            />
          )}

          {currentView === 'perfil' && (
            <ProfileDetailView 
              professional={selectedProfessional} 
              onBack={() => setView('profissionais')} 
            />
          )}

          {currentView === 'cadastrar' && (
            <RegisterView onSuccess={() => { setCategoryFilter(null); loadProfiles(); setView('profissionais'); }} />
          )}

          {currentView === 'dashboard' && (
            <DashboardView />
          )}
        </main>
      </div>

      <Footer setView={setView} />
    </div>
  )
}