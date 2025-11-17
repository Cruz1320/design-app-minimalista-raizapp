'use client'

import { useState, useEffect } from 'react'
import { User, Home, CheckSquare, Settings, Users, FileText, Activity, ChevronRight, Eye, EyeOff, Mail, Lock, UserCircle, Bell, Globe, HelpCircle, Shield, Moon, Leaf, Heart, Brain, Target, Zap, Coffee, Moon as MoonIcon, Utensils, Dumbbell, Focus, Wind, TrendingUp, Clock, MessageCircle, Smile, LogOut } from 'lucide-react'
import { signUp, signIn, signOut, getCurrentUser, getUserProfile, saveQuizResponses, getQuizResponses, getUserActivities, createActivity, isUserAdmin, getAllUsers } from '@/lib/auth'
import type { UserProfile, UserActivity } from '@/lib/supabase'
import { useSupabase } from '@/components/providers/SupabaseProvider'

export default function RaizApp() {
  const { session, user: authUser, loading: authLoading } = useSupabase()
  const [currentScreen, setCurrentScreen] = useState<'login' | 'signup' | 'quiz' | 'dashboard' | 'settings' | 'admin'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [currentQuizStep, setCurrentQuizStep] = useState(1)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  
  // Estados de autenticação
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estados de dados
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  
  // Estados de formulário
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const totalQuizSteps = 15

  // Verificar autenticação quando sessão mudar
  useEffect(() => {
    if (!authLoading && authUser) {
      loadUserProfile()
    } else if (!authLoading && !authUser) {
      setCurrentScreen('login')
    }
  }, [authUser, authLoading])

  // Carregar dados quando usuário estiver autenticado
  useEffect(() => {
    if (authUser && currentScreen === 'dashboard') {
      loadUserData()
    }
  }, [authUser, currentScreen])

  async function loadUserProfile() {
    if (!authUser) return
    
    try {
      const profile = await getUserProfile(authUser.id)
      setUserProfile(profile)
      const adminStatus = await isUserAdmin(authUser.id)
      setIsAdmin(adminStatus)
      
      // Verificar se já completou o quiz
      const responses = await getQuizResponses(authUser.id)
      if (responses && responses.length > 0) {
        setCurrentScreen('dashboard')
      } else {
        setCurrentScreen('quiz')
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
    }
  }

  async function loadUserData() {
    if (!authUser) return
    
    try {
      const userActivities = await getUserActivities(authUser.id, 10)
      setActivities(userActivities || [])
      
      if (isAdmin) {
        const users = await getAllUsers()
        setAllUsers(users || [])
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      await signUp(email, password, fullName)
      alert('Conta criada com sucesso! Verifique seu email para confirmar.')
      setCurrentScreen('login')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      await signIn(email, password)
      // O hook useSupabase vai detectar a mudança automaticamente
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
      setUserProfile(null)
      setIsAdmin(false)
      setCurrentScreen('login')
    } catch (err: any) {
      setError(err.message || 'Erro ao sair')
    }
  }

  // Dados das perguntas do quiz
  const quizQuestions = [
    {
      id: 1,
      question: "Como você descreveria seu momento atual da vida?",
      description: "Seja honesto consigo mesmo. Não há resposta certa ou errada.",
      options: ["Sobrecarregado", "Equilibrado", "Perdido", "Motivado", "Reconstruindo"],
      icon: Heart
    },
    {
      id: 2,
      question: "Qual é o seu principal objetivo emocional agora?",
      description: "O que você mais busca neste momento?",
      options: ["Paz mental", "Foco", "Disciplina", "Energia", "Autoconfiança"],
      icon: Brain
    },
    {
      id: 3,
      question: "Como você está lidando com a sua rotina diária?",
      description: "Pense na organização do seu dia a dia.",
      options: ["Desorganizada", "Ok", "Muito organizada", "Inexistente"],
      icon: Target
    },
    {
      id: 4,
      question: "Com que frequência você sente ansiedade?",
      description: "Seja sincero sobre seus sentimentos.",
      options: ["Raramente", "Às vezes", "Frequentemente", "Quase sempre"],
      icon: Wind
    },
    {
      id: 5,
      question: "Você sente que tem controle sobre seus hábitos?",
      description: "Reflita sobre sua capacidade de manter rotinas.",
      options: ["Sim", "Parcialmente", "Não"],
      icon: Target
    },
    {
      id: 6,
      question: "Quanto você dorme por noite?",
      description: "Qualidade do sono é fundamental para o bem-estar.",
      options: ["Menos de 5h", "5–7h", "7–9h", "Mais de 9h"],
      icon: MoonIcon
    },
    {
      id: 7,
      question: "Como está sua alimentação?",
      description: "Pense nos seus hábitos alimentares recentes.",
      options: ["Ruim", "Irregular", "Normal", "Saudável"],
      icon: Utensils
    },
    {
      id: 8,
      question: "Você sente dificuldade em manter disciplina?",
      description: "Seja honesto sobre seus desafios.",
      options: ["Muita", "Média", "Pouca", "Nenhuma"],
      icon: Zap
    },
    {
      id: 9,
      question: "O que você quer mudar primeiro?",
      description: "Escolha sua prioridade principal.",
      options: ["Hábitos", "Emoções", "Produtividade", "Saúde", "Ambiente"],
      icon: TrendingUp
    },
    {
      id: 10,
      question: "Você pratica atividade física?",
      description: "Movimento é essencial para o equilíbrio.",
      options: ["Sim", "Raramente", "Não", "Quero começar"],
      icon: Dumbbell
    },
    {
      id: 11,
      question: "Qual é seu maior desafio hoje?",
      description: "Identifique o que mais te impacta.",
      options: ["Foco", "Ansiedade", "Rotina", "Sono", "Motivação"],
      icon: Focus
    },
    {
      id: 12,
      question: "Como você lida com pressão?",
      description: "Entenda seu padrão de resposta ao estresse.",
      options: ["Evito", "Travo", "Resisto", "Enfrento bem"],
      icon: Wind
    },
    {
      id: 13,
      question: "Qual ritmo você quer para sua jornada?",
      description: "Escolha o que faz sentido para você agora.",
      options: ["Leve", "Moderado", "Intenso"],
      icon: TrendingUp
    },
    {
      id: 14,
      question: "Quanto tempo por dia você quer dedicar ao seu crescimento pessoal?",
      description: "Seja realista com seu tempo disponível.",
      options: ["5 min", "10 min", "15 min", "20+ min"],
      icon: Clock
    },
    {
      id: 15,
      question: "O que você espera do RaizApp?",
      description: "Sua expectativa nos ajuda a personalizar sua experiência.",
      options: ["Clareza", "Auto-organização", "Força emocional", "Mudança de hábitos", "Tudo isso"],
      icon: Smile
    }
  ]

  const handleQuizAnswer = async (answer: string) => {
    const newAnswers = { ...quizAnswers, [currentQuizStep]: answer }
    setQuizAnswers(newAnswers)
    
    if (currentQuizStep < totalQuizSteps) {
      setTimeout(() => {
        setCurrentQuizStep(currentQuizStep + 1)
      }, 300)
    } else {
      // Quiz completo, salvar no Supabase
      try {
        if (authUser) {
          await saveQuizResponses(authUser.id, newAnswers, quizQuestions)
          await createActivity(authUser.id, 'Quiz de Jornada Completo', 'Você completou o quiz de configuração da sua jornada', 'quiz_completed')
        }
        setTimeout(() => {
          setCurrentScreen('dashboard')
        }, 500)
      } catch (err) {
        console.error('Erro ao salvar quiz:', err)
        setCurrentScreen('dashboard')
      }
    }
  }

  // Tela de Login
  const LoginScreen = () => (
    <div className="min-h-screen bg-[#0F2F1F] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Textura sutil de fundo */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }}></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#E8DCC4] rounded-2xl mb-6 shadow-lg">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#0F2F1F]">
              <path d="M24 8C24 8 18 14 18 20C18 23.314 20.686 26 24 26C27.314 26 30 23.314 30 20C30 14 24 8 24 8Z" fill="currentColor"/>
              <path d="M24 26V40M24 40L18 34M24 40L30 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#E8DCC4] mb-2">RaizApp</h1>
          <p className="text-[#A8C5B0] text-lg">Entrar na sua raiz</p>
        </div>

        {/* Card de Login */}
        <form onSubmit={handleSignIn} className="bg-[#E8DCC4] rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            {/* Campo Email */}
            <div>
              <label className="block text-sm font-medium text-[#0F2F1F] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0F2F1F]/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/60 border-2 border-[#0F2F1F]/10 rounded-xl focus:outline-none focus:border-[#0F2F1F] transition-all text-[#0F2F1F] placeholder:text-[#0F2F1F]/40"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-[#0F2F1F] mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0F2F1F]/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-white/60 border-2 border-[#0F2F1F]/10 rounded-xl focus:outline-none focus:border-[#0F2F1F] transition-all text-[#0F2F1F] placeholder:text-[#0F2F1F]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0F2F1F]/40 hover:text-[#0F2F1F] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#0F2F1F] text-white py-4 rounded-xl font-semibold hover:bg-[#1a4a30] transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading ? 'Entrando...' : 'Entrar'}
            </button>

            {/* Links */}
            <div className="flex items-center justify-between text-sm pt-2">
              <button
                type="button"
                onClick={() => setCurrentScreen('signup')}
                className="text-[#0F2F1F] hover:text-[#1a4a30] font-medium transition-colors"
              >
                Criar conta
              </button>
              <button type="button" className="text-[#0F2F1F]/60 hover:text-[#0F2F1F] transition-colors">
                Esqueci minha senha
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )

  // Tela de Cadastro
  const SignupScreen = () => (
    <div className="min-h-screen bg-[#0F2F1F] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Textura sutil de fundo */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }}></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#E8DCC4] rounded-2xl mb-6 shadow-lg">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#0F2F1F]">
              <path d="M24 8C24 8 18 14 18 20C18 23.314 20.686 26 24 26C27.314 26 30 23.314 30 20C30 14 24 8 24 8Z" fill="currentColor"/>
              <path d="M24 26V40M24 40L18 34M24 40L30 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#E8DCC4] mb-2">RaizApp</h1>
          <p className="text-[#A8C5B0] text-lg">Criar sua raiz</p>
        </div>

        {/* Card de Cadastro */}
        <form onSubmit={handleSignUp} className="bg-[#E8DCC4] rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            {/* Campo Nome */}
            <div>
              <label className="block text-sm font-medium text-[#0F2F1F] mb-2">Nome completo</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0F2F1F]/40" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/60 border-2 border-[#0F2F1F]/10 rounded-xl focus:outline-none focus:border-[#0F2F1F] transition-all text-[#0F2F1F] placeholder:text-[#0F2F1F]/40"
                />
              </div>
            </div>

            {/* Campo Email */}
            <div>
              <label className="block text-sm font-medium text-[#0F2F1F] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0F2F1F]/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/60 border-2 border-[#0F2F1F]/10 rounded-xl focus:outline-none focus:border-[#0F2F1F] transition-all text-[#0F2F1F] placeholder:text-[#0F2F1F]/40"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-[#0F2F1F] mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0F2F1F]/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3.5 bg-white/60 border-2 border-[#0F2F1F]/10 rounded-xl focus:outline-none focus:border-[#0F2F1F] transition-all text-[#0F2F1F] placeholder:text-[#0F2F1F]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0F2F1F]/40 hover:text-[#0F2F1F] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botão Criar Conta */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#0F2F1F] text-white py-4 rounded-xl font-semibold hover:bg-[#1a4a30] transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading ? 'Criando conta...' : 'Criar conta'}
            </button>

            {/* Link para Login */}
            <div className="text-center text-sm pt-2">
              <span className="text-[#0F2F1F]/60">Já tem uma conta? </span>
              <button
                type="button"
                onClick={() => setCurrentScreen('login')}
                className="text-[#0F2F1F] hover:text-[#1a4a30] font-medium transition-colors"
              >
                Entrar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )

  // Tela de Quiz
  const QuizScreen = () => {
    const currentQuestion = quizQuestions[currentQuizStep - 1]
    const progress = (currentQuizStep / totalQuizSteps) * 100
    const IconComponent = currentQuestion.icon

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F2F1F] via-[#1a4a30] to-[#0F2F1F] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Textura sutil de fundo */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}></div>

        <div className="w-full max-w-md relative z-10">
          {/* Card do Quiz */}
          <div className="bg-[#1a4a30]/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-[#A8C5B0]/20">
            {/* Ícone Circular */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#4a7c59] rounded-full flex items-center justify-center shadow-lg">
                <IconComponent className="w-10 h-10 text-[#E8DCC4]" />
              </div>
            </div>

            {/* Título e Subtítulo */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#E8DCC4] mb-2">Configure Sua Jornada</h1>
              <p className="text-[#A8C5B0] text-sm">Passo {currentQuizStep} de {totalQuizSteps}</p>
            </div>

            {/* Barra de Progresso */}
            <div className="mb-8">
              <div className="h-2 bg-[#0F2F1F]/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#4a7c59] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Pergunta */}
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-white mb-3 leading-tight">
                {currentQuestion.question}
              </h2>
              {currentQuestion.description && (
                <p className="text-[#A8C5B0] text-sm leading-relaxed">
                  {currentQuestion.description}
                </p>
              )}
            </div>

            {/* Opções */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuizAnswer(option)}
                  className="w-full bg-[#E8DCC4]/10 hover:bg-[#4a7c59] border-2 border-[#A8C5B0]/30 hover:border-[#4a7c59] text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] text-left"
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Indicador de Passos */}
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalQuizSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index < currentQuizStep 
                      ? 'w-8 bg-[#4a7c59]' 
                      : index === currentQuizStep - 1
                      ? 'w-12 bg-[#4a7c59]'
                      : 'w-1.5 bg-[#A8C5B0]/30'
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {/* Botão Voltar (opcional) */}
          {currentQuizStep > 1 && (
            <button
              onClick={() => setCurrentQuizStep(currentQuizStep - 1)}
              className="mt-6 w-full text-[#A8C5B0] hover:text-[#E8DCC4] font-medium transition-colors text-center"
            >
              ← Voltar
            </button>
          )}
        </div>
      </div>
    )
  }

  // Tela Dashboard
  const DashboardScreen = () => {
    const userName = userProfile?.full_name || authUser?.email?.split('@')[0] || 'Usuário'
    const taskCount = activities.length
    const progress = Math.min(Math.round((taskCount / 20) * 100), 100)

    return (
      <div className="min-h-screen bg-[#0F2F1F] pb-20">
        {/* Header */}
        <div className="bg-[#0F2F1F] px-6 pt-8 pb-6 border-b border-[#A8C5B0]/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#E8DCC4]">Olá, {userName}</h1>
              <p className="text-[#A8C5B0] text-sm mt-1">Bem-vindo de volta à sua raiz</p>
            </div>
            <div className="w-12 h-12 bg-[#E8DCC4] rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-[#0F2F1F]" />
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-6 space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#E8DCC4] rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <CheckSquare className="w-6 h-6 text-[#0F2F1F]" />
                <span className="text-2xl font-bold text-[#0F2F1F]">{taskCount}</span>
              </div>
              <p className="text-sm text-[#0F2F1F]/70 font-medium">Atividades</p>
            </div>
            
            <div className="bg-[#A8C5B0] rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <Activity className="w-6 h-6 text-[#0F2F1F]" />
                <span className="text-2xl font-bold text-[#0F2F1F]">{progress}%</span>
              </div>
              <p className="text-sm text-[#0F2F1F]/70 font-medium">Progresso</p>
            </div>
          </div>

          {/* Seção Recentes */}
          <div>
            <h2 className="text-lg font-semibold text-[#E8DCC4] mb-4">Atividades recentes</h2>
            <div className="space-y-3">
              {activities.length > 0 ? (
                activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="bg-[#E8DCC4] rounded-xl p-4 flex items-center justify-between shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0F2F1F] rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-[#E8DCC4]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#0F2F1F]">{activity.title}</p>
                        <p className="text-sm text-[#0F2F1F]/60">
                          {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#0F2F1F]/40" />
                  </div>
                ))
              ) : (
                <div className="bg-[#E8DCC4] rounded-xl p-6 text-center">
                  <p className="text-[#0F2F1F]/60">Nenhuma atividade ainda</p>
                  <p className="text-sm text-[#0F2F1F]/40 mt-1">Comece sua jornada agora!</p>
                </div>
              )}
            </div>
          </div>

          {/* Card de Ação */}
          <div className="bg-gradient-to-br from-[#1a4a30] to-[#0F2F1F] rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-[#E8DCC4] mb-2">Continue crescendo</h3>
            <p className="text-[#A8C5B0] text-sm mb-4">Explore novas funcionalidades e organize suas tarefas</p>
            <button className="bg-[#E8DCC4] text-[#0F2F1F] px-6 py-2.5 rounded-lg font-semibold hover:bg-[#d4c8ac] transition-colors">
              Começar agora
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#E8DCC4] border-t border-[#0F2F1F]/10 px-6 py-4 shadow-2xl">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {[
              { icon: Home, label: 'Início', active: true },
              { icon: CheckSquare, label: 'Tarefas', active: false },
              { icon: User, label: 'Perfil', active: false },
              { icon: Settings, label: 'Config', active: false, onClick: () => setCurrentScreen('settings') }
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.onClick}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  item.active ? 'text-[#0F2F1F]' : 'text-[#0F2F1F]/40 hover:text-[#0F2F1F]/70'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Tela de Configurações
  const SettingsScreen = () => (
    <div className="min-h-screen bg-[#F5F5F0] pb-20">
      {/* Header */}
      <div className="bg-white px-6 pt-8 pb-6 border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-[#0F2F1F]">Configurações</h1>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-6 py-6 space-y-6">
        {/* Seção Conta */}
        <div>
          <h2 className="text-sm font-semibold text-[#0F2F1F]/60 uppercase tracking-wide mb-3 px-2">Conta</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {[
              { icon: UserCircle, label: 'Editar perfil', color: 'text-[#0F2F1F]' },
              { icon: Shield, label: 'Segurança / Alterar senha', color: 'text-[#0F2F1F]' },
              { icon: Bell, label: 'Notificações', color: 'text-[#0F2F1F]' }
            ].map((item, i, arr) => (
              <button
                key={i}
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                  i !== arr.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="font-medium text-[#0F2F1F]">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Seção App */}
        <div>
          <h2 className="text-sm font-semibold text-[#0F2F1F]/60 uppercase tracking-wide mb-3 px-2">App</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {[
              { icon: Moon, label: 'Tema escuro/claro', color: 'text-[#0F2F1F]', hasToggle: true },
              { icon: Globe, label: 'Idioma', color: 'text-[#0F2F1F]', value: 'Português' },
              { icon: HelpCircle, label: 'Ajuda / Suporte', color: 'text-[#0F2F1F]' }
            ].map((item, i, arr) => (
              <button
                key={i}
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                  i !== arr.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="font-medium text-[#0F2F1F]">{item.label}</span>
                </div>
                {item.hasToggle ? (
                  <div className="w-12 h-6 bg-[#0F2F1F] rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                ) : item.value ? (
                  <span className="text-gray-500 text-sm">{item.value}</span>
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Seção Administração (apenas para admin) */}
        {isAdmin && (
          <div>
            <h2 className="text-sm font-semibold text-[#0F2F1F]/60 uppercase tracking-wide mb-3 px-2">Administração</h2>
            <button
              onClick={() => setCurrentScreen('admin')}
              className="w-full bg-white rounded-2xl shadow-sm border-2 border-[#0F2F1F] hover:bg-[#0F2F1F]/5 transition-colors p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0F2F1F] rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#E8DCC4]" />
                  </div>
                  <span className="font-semibold text-[#0F2F1F]">Painel Administrativo</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0F2F1F]" />
              </div>
            </button>
          </div>
        )}

        {/* Botão Sair */}
        <div>
          <button
            onClick={handleSignOut}
            className="w-full bg-red-50 border-2 border-red-200 rounded-2xl shadow-sm hover:bg-red-100 transition-colors p-4"
          >
            <div className="flex items-center justify-center gap-3">
              <LogOut className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-600">Sair da conta</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )

  // Tela de Administração
  const AdminScreen = () => (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Header Admin */}
      <div className="bg-[#0F2F1F] px-6 pt-8 pb-6 shadow-lg">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => setCurrentScreen('settings')}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[#E8DCC4] rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#E8DCC4]">Admin – RaizApp</h1>
            <p className="text-[#A8C5B0] text-sm mt-1">Painel de controle</p>
          </div>
        </div>
      </div>

      {/* Conteúdo Admin */}
      <div className="px-6 py-6 space-y-6">
        {/* Gerenciar Usuários */}
        <div>
          <h2 className="text-lg font-semibold text-[#0F2F1F] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciar usuários ({allUsers.length})
          </h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {allUsers.length > 0 ? (
              allUsers.slice(0, 10).map((profile, i, arr) => (
                <div
                  key={profile.id}
                  className={`p-4 ${i !== arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-[#0F2F1F]">{profile.full_name || 'Sem nome'}</p>
                      <p className="text-sm text-gray-500">{profile.id.substring(0, 8)}...</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      profile.is_admin 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {profile.is_admin ? 'Admin' : 'Usuário'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-[#0F2F1F] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#1a4a30] transition-colors">
                      Ver detalhes
                    </button>
                    <button className="px-4 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      Editar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                Nenhum usuário encontrado
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas */}
        <div>
          <h2 className="text-lg font-semibold text-[#0F2F1F] mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Estatísticas
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Usuários', count: allUsers.length, icon: Users },
              { title: 'Atividades', count: activities.length, icon: Activity },
              { title: 'Quiz Completos', count: allUsers.filter(u => !u.is_admin).length, icon: CheckSquare },
              { title: 'Admins', count: allUsers.filter(u => u.is_admin).length, icon: Shield }
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <item.icon className="w-6 h-6 text-[#0F2F1F] mb-2" />
                <p className="text-2xl font-bold text-[#0F2F1F] mb-1">{item.count}</p>
                <p className="text-sm text-gray-600">{item.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Configurações Internas */}
        <div>
          <h2 className="text-lg font-semibold text-[#0F2F1F] mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações internas
          </h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {[
              'Backup automático',
              'Manutenção do sistema',
              'Permissões avançadas',
              'Integrações'
            ].map((item, i, arr) => (
              <button
                key={i}
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                  i !== arr.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <span className="font-medium text-[#0F2F1F]">{item}</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F2F1F] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#E8DCC4] rounded-2xl mb-6 shadow-lg animate-pulse">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#0F2F1F]">
              <path d="M24 8C24 8 18 14 18 20C18 23.314 20.686 26 24 26C27.314 26 30 23.314 30 20C30 14 24 8 24 8Z" fill="currentColor"/>
              <path d="M24 26V40M24 40L18 34M24 40L30 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-[#E8DCC4] text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  // Renderização condicional
  return (
    <>
      {currentScreen === 'login' && <LoginScreen />}
      {currentScreen === 'signup' && <SignupScreen />}
      {currentScreen === 'quiz' && <QuizScreen />}
      {currentScreen === 'dashboard' && <DashboardScreen />}
      {currentScreen === 'settings' && <SettingsScreen />}
      {currentScreen === 'admin' && <AdminScreen />}
    </>
  )
}
