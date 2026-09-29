import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { HomeView } from './components/HomeView'
import { ProfessionalsView } from './components/ProfessionalsView'
import { ProfileDetailView } from './components/ProfileDetailView'
import { RegisterView } from './components/RegisterView'
import { LoginView } from './components/LoginView'
import { ProfessionalPortal } from './components/ProfessionalPortal'
import { ClientPortal } from './components/ClientPortal'
import { Footer } from './components/Footer'
import { fetchProfiles } from './services/profiles'
import { supabase } from './lib/supabase'

export default function App() {
  const [currentView, setView] = useState('home')
  const [profiles, setProfiles] = useState([])
  const [selectedProfessional, setSelectedProfessional] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null) // 'client' ou 'professional'

  useEffect(() => {
    // 1. Verifica se já existe um utilizador autenticado ao carregar a página
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        fetchUserRole(user.id)
      }
    })

    // 2. Escuta alterações no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      if (currentUser) {
        fetchUserRole(currentUser.id)
      } else {
        setUserRole(null)
      }
    })

    loadProfiles(categoryFilter)

    return () => subscription.unsubscribe()
  }, [categoryFilter])

  // Procura a 'role' do utilizador na tabela 'profiles'
  const fetchUserRole = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    setUserRole(data?.role || 'client')
  }

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
    setView('home')
  }

  // SE O UTILIZADOR ESTIVER LOGADO E NA VISÃO 'PORTAL'
  if (user && currentView === 'portal') {
    // Se for Cliente, exibe o ClientPortal
    if (userRole === 'client') {
      return (
        <ClientPortal 
          user={user} 
          onLogout={handleLogout} 
          onGoToPublicSite={() => setView('home')} 
        />
      )
    }

    // Se for Profissional, exibe o ProfessionalPortal
    return (
      <ProfessionalPortal 
        user={user} 
        onLogout={handleLogout} 
        onGoToPublicSite={() => setView('home')} 
      />
    )
  }

  // VISÃO PÚBLICA DO SITE (com Navbar e Footer)
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col justify-between">
      <div>
        <Navbar 
          currentView={currentView} 
          setView={setView} 
          onNavigateSection={handleNavigateSection}
          user={user}
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

          {currentView === 'login' && (
            <LoginView 
              onLoginSuccess={async (loggedUser) => { 
                setUser(loggedUser)
                await fetchUserRole(loggedUser.id)
                setView('portal')
              }} 
            />
          )}
        </main>
      </div>

      <Footer setView={setView} />
    </div>
  )
}