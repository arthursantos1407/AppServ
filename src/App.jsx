import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { HomeView } from './components/HomeView'
import { ProfessionalsView } from './components/ProfessionalsView'
import { ProfileDetailView } from './components/ProfileDetailView'
import { RegisterView } from './components/RegisterView'
import { LoginView } from './components/LoginView'
import { ProfessionalPortal } from './components/ProfessionalPortal'
import { ClientPortal } from './components/ClientPortal'
import { MercadoPagoCallback } from './components/MercadoPagoCallback'
import { AdminPortal } from './components/AdminPortal'
import { PrivacyPolicyView } from './components/PrivacyPolicyView'
import { NotFoundView } from './components/NotFoundView'
import { Footer } from './components/Footer'
import { fetchProfiles } from './services/profiles'
import { supabase } from './lib/supabase'

export default function App() {
  // 1. Verifica se o endereço atual é a rota do Callback do Mercado Pago
  if (window.location.pathname.startsWith('/mp-callback')) {
    return <MercadoPagoCallback />
  }

  const [currentView, setView] = useState('home')
  const [profiles, setProfiles] = useState([])
  const [selectedProfessional, setSelectedProfessional] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null) // 'client' | 'professional' | 'admin'

  useEffect(() => {
    // Detecta se a rota na URL é /privacidade
    if (window.location.pathname.startsWith('/privacidade')) {
      setView('privacidade')
    }

    // Verifica utilizador autenticado ao carregar a página
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        fetchUserRole(user.id, user)
      }
    })

    // Escuta alterações no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      if (currentUser) {
        fetchUserRole(currentUser.id, currentUser)
      } else {
        setUserRole(null)
      }
    })

    loadProfiles(categoryFilter)

    return () => subscription.unsubscribe()
  }, [categoryFilter])

  // Procura a 'role' do utilizador na tabela 'profiles' ou nos metadados do Auth
  const fetchUserRole = async (userId, userObj = null) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    const resolvedRole = data?.role || userObj?.user_metadata?.role || 'client'
    setUserRole(resolvedRole)
    return resolvedRole
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
    if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/privacidade')) {
      window.history.pushState({}, '', '/')
    }
  }

  // 2. ROTA DO PAINEL ADMINISTRATIVO (Via URL /admin ou Estado 'admin')
  if (window.location.pathname.startsWith('/admin') || currentView === 'admin') {
    return (
      <AdminPortal 
        onGoToPublicSite={() => {
          if (window.location.pathname.startsWith('/admin')) {
            window.history.pushState({}, '', '/')
          }
          setView('home')
        }} 
        onLogout={handleLogout}
      />
    )
  }

  // 3. SE O UTILIZADOR ESTIVER LOGADO E NA VISÃO 'PORTAL'
  if (user && currentView === 'portal') {
    if (userRole === 'admin') {
      return (
        <AdminPortal 
          onGoToPublicSite={() => setView('home')} 
          onLogout={handleLogout} 
        />
      )
    }

    if (userRole === 'client') {
      return (
        <ClientPortal 
          user={user} 
          onLogout={handleLogout} 
          onGoToPublicSite={() => setView('home')} 
        />
      )
    }

    return (
      <ProfessionalPortal 
        user={user} 
        onLogout={handleLogout} 
        onGoToPublicSite={() => setView('home')} 
      />
    )
  }

  // Listagem de telas válidas para fallback do 404
  const validViews = ['home', 'profissionais', 'perfil', 'cadastrar', 'login', 'privacidade']
  const isNotFound = !validViews.includes(currentView)

  // 4. VISÃO PÚBLICA DO SITE
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
            <RegisterView 
              onSuccess={async () => { 
                setCategoryFilter(null); 
                await loadProfiles(); 
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                if (currentUser) {
                  setUser(currentUser);
                  await fetchUserRole(currentUser.id, currentUser);
                }
                setView('portal'); 
              }} 
            />
          )}

          {currentView === 'login' && (
            <LoginView 
              onLoginSuccess={async (loggedUser) => { 
                setUser(loggedUser)
                const role = await fetchUserRole(loggedUser.id, loggedUser)
                if (role === 'admin') {
                  setView('admin')
                } else {
                  setView('portal')
                }
              }} 
            />
          )}

          {currentView === 'privacidade' && (
            <PrivacyPolicyView 
              onBack={() => {
                if (window.location.pathname.startsWith('/privacidade')) {
                  window.history.pushState({}, '', '/')
                }
                setView('home')
              }} 
            />
          )}

          {isNotFound && (
            <NotFoundView 
              onGoHome={() => setView('home')} 
              onGoSearch={() => setView('profissionais')} 
            />
          )}
        </main>
      </div>

      <Footer setView={setView} />
    </div>
  )
}