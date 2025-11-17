import { createSupabaseClient } from './supabase'

// Signup com nome completo
export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createSupabaseClient()
  
  // Validação de entrada
  if (!email || !password || !fullName) {
    throw new Error('Email, senha e nome completo são obrigatórios')
  }
  
  if (password.length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres')
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: fullName,
      },
    },
  })

  if (error) throw error
  
  // Criar perfil do usuário após signup
  if (data.user) {
    await createUserProfile(data.user.id, email, fullName)
  }
  
  return data
}

// Criar perfil do usuário com tratamento robusto de erros
async function createUserProfile(userId: string, email: string, fullName: string) {
  const supabase = createSupabaseClient()
  
  console.log('🔵 [createUserProfile] Iniciando criação de perfil:', {
    userId: userId?.substring(0, 8) + '...',
    email,
    fullName,
    timestamp: new Date().toISOString()
  })
  
  // Validação de entrada
  if (!userId) {
    console.error('❌ [createUserProfile] userId é null ou undefined')
    throw new Error('userId é obrigatório para criar perfil')
  }
  
  if (!fullName || fullName.trim() === '') {
    console.error('❌ [createUserProfile] fullName é inválido:', fullName)
    throw new Error('Nome completo é obrigatório')
  }
  
  // ✅ CORRIGIDO: usando 'id' em vez de 'user_id' para compatibilidade com RLS
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId, // ✅ Usando 'id' para compatibilidade com policy: auth.uid() = id
      user_id: userId, // Mantém user_id também para compatibilidade
      name: fullName.trim(),
      email: email,
      subscription_status: 'free',
    })
    .select()
    .single()
  
  // Log detalhado do erro
  if (error) {
    console.error('❌ [createUserProfile] Erro ao criar perfil:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      userId: userId?.substring(0, 8) + '...',
      fullName,
      errorObject: JSON.stringify(error, null, 2)
    })
    
    // Ignorar erro de duplicação (usuário já existe)
    if (error.code === '23505') {
      console.log('⚠️ [createUserProfile] Perfil já existe (ignorando erro de duplicação)')
      return
    }
    
    // Verificar se é erro de RLS
    if (error.code === '42501' || error.message?.includes('policy') || error.message?.includes('permission')) {
      console.error('🔒 [createUserProfile] ERRO DE RLS: Política de segurança bloqueou o INSERT')
      console.error('💡 Solução: A policy deve permitir INSERT com: auth.uid() = id')
      throw new Error('Erro de permissão RLS. A política de segurança bloqueou a criação do perfil.')
    }
    
    // Verificar se é erro de tabela não encontrada
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      console.error('📋 [createUserProfile] ERRO: Tabela user_profiles não existe')
      throw new Error('Tabela user_profiles não encontrada no banco de dados')
    }
    
    // Verificar se é erro de coluna não encontrada
    if (error.code === 'PGRST204' || error.message?.includes('column')) {
      console.error('📋 [createUserProfile] ERRO: Coluna não encontrada no schema')
      throw new Error(`Erro de schema: ${error.message}`)
    }
    
    // Erro genérico
    throw new Error(`Erro ao criar perfil: ${error.message || 'Erro desconhecido'}`)
  }
  
  console.log('✅ [createUserProfile] Perfil criado com sucesso:', {
    userId: userId?.substring(0, 8) + '...',
    fullName,
    data
  })
  
  return data
}

// Login
export async function signIn(email: string, password: string) {
  const supabase = createSupabaseClient()
  
  if (!email || !password) {
    throw new Error('Email e senha são obrigatórios')
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

// Logout
export async function signOut() {
  const supabase = createSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Obter usuário atual
export async function getCurrentUser() {
  const supabase = createSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Obter perfil do usuário (com criação automática se não existir)
export async function getUserProfile(userId: string) {
  const supabase = createSupabaseClient()
  
  console.log('🔵 [getUserProfile] Buscando perfil:', {
    userId: userId?.substring(0, 8) + '...',
    timestamp: new Date().toISOString()
  })
  
  // Validação de entrada
  if (!userId) {
    console.error('❌ [getUserProfile] userId é null ou undefined')
    throw new Error('userId é obrigatório')
  }
  
  // Tentar buscar perfil existente usando id (primary key)
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  // Log de erro na busca
  if (error) {
    console.error('❌ [getUserProfile] Erro ao buscar perfil:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      userId: userId?.substring(0, 8) + '...',
      errorObject: JSON.stringify(error, null, 2)
    })
    
    // Verificar se é erro de tabela não encontrada
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      throw new Error('Tabela user_profiles não encontrada. Execute o setup do banco de dados.')
    }
    
    // Retornar perfil padrão em caso de erro
    const { data: { user } } = await supabase.auth.getUser()
    console.log('⚠️ [getUserProfile] Retornando perfil padrão devido a erro')
    return {
      id: userId,
      user_id: userId,
      name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário',
      email: user?.email || '',
      subscription_status: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  // Se não encontrou o perfil, criar um novo
  if (!data) {
    console.log('⚠️ [getUserProfile] Perfil não encontrado, criando novo...')
    
    const { data: { user } } = await supabase.auth.getUser()
    const fullName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'
    const email = user?.email || ''
    
    console.log('🔵 [getUserProfile] Dados para criação:', {
      userId: userId?.substring(0, 8) + '...',
      fullName,
      email,
      userMetadata: user?.user_metadata
    })
    
    // ✅ CORRIGIDO: usando 'id' em vez de 'user_id' para compatibilidade com RLS
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId, // ✅ Usando 'id' para compatibilidade com policy: auth.uid() = id
        user_id: userId, // Mantém user_id também para compatibilidade
        name: fullName,
        email: email,
        subscription_status: 'free',
      })
      .select()
      .single()
    
    if (createError) {
      console.error('❌ [getUserProfile] Erro ao criar perfil:', {
        code: createError.code,
        message: createError.message,
        details: createError.details,
        hint: createError.hint,
        userId: userId?.substring(0, 8) + '...',
        fullName,
        errorObject: JSON.stringify(createError, null, 2)
      })
      
      // Verificar tipo de erro
      if (createError.code === '42501' || createError.message?.includes('policy') || createError.message?.includes('permission')) {
        console.error('🔒 [getUserProfile] ERRO DE RLS: Política de segurança bloqueou o INSERT')
        console.error('💡 Solução: A policy deve permitir INSERT com: auth.uid() = id')
        throw new Error('Erro de permissão RLS ao criar perfil. Verifique as políticas de segurança.')
      }
      
      if (createError.code === '23505') {
        console.log('⚠️ [getUserProfile] Perfil já existe (erro de duplicação), tentando buscar novamente...')
        // Tentar buscar novamente
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (existingProfile) {
          console.log('✅ [getUserProfile] Perfil encontrado após erro de duplicação')
          return existingProfile
        }
      }
      
      if (createError.code === 'PGRST204' || createError.message?.includes('column')) {
        console.error('📋 [getUserProfile] ERRO: Coluna não encontrada no schema')
        throw new Error(`Erro de schema: ${createError.message}`)
      }
      
      // Retornar perfil padrão se falhar
      console.log('⚠️ [getUserProfile] Retornando perfil padrão após falha na criação')
      return {
        id: userId,
        user_id: userId,
        name: fullName,
        email: email,
        subscription_status: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
    
    console.log('✅ [getUserProfile] Perfil criado com sucesso:', {
      userId: userId?.substring(0, 8) + '...',
      fullName,
      profile: newProfile
    })
    
    return newProfile
  }
  
  console.log('✅ [getUserProfile] Perfil encontrado:', {
    userId: userId?.substring(0, 8) + '...',
    name: data.name,
    email: data.email
  })
  
  return data
}

// Salvar perfil do usuário
export async function saveUserProfile(userId: string, profileData: {
  name?: string
  email?: string
  avatar_url?: string
}) {
  const supabase = createSupabaseClient()
  
  console.log('🔵 [saveUserProfile] Atualizando perfil:', {
    userId: userId?.substring(0, 8) + '...',
    profileData
  })
  
  if (!userId) {
    throw new Error('userId é obrigatório')
  }
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      name: profileData.name,
      email: profileData.email,
      avatar_url: profileData.avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId) // ✅ Usando 'id' em vez de 'user_id'
    .select()
    .single()

  if (error) {
    console.error('❌ [saveUserProfile] Erro ao atualizar perfil:', {
      code: error.code,
      message: error.message,
      details: error.details,
      errorObject: JSON.stringify(error, null, 2)
    })
    
    if (error.code === 'PGRST204' || error.message?.includes('column')) {
      throw new Error(`Erro de schema: ${error.message}`)
    }
    
    throw error
  }
  
  console.log('✅ [saveUserProfile] Perfil atualizado com sucesso')
  return data
}

// Verificar se usuário é admin (retorna false por padrão já que coluna não existe)
export async function isUserAdmin(userId: string) {
  try {
    const profile = await getUserProfile(userId)
    // Como a coluna is_admin não existe na tabela, sempre retorna false
    // Você pode adicionar a coluna manualmente no Supabase se precisar dessa funcionalidade
    return false
  } catch (error) {
    console.error('❌ [isUserAdmin] Erro ao verificar admin:', error)
    return false
  }
}

// Salvar respostas do quiz
export async function saveQuizResponses(userId: string, responses: Record<number, string>, questions: any[]) {
  const supabase = createSupabaseClient()
  
  console.log('🔵 [saveQuizResponses] Salvando respostas do quiz:', {
    userId: userId?.substring(0, 8) + '...',
    totalRespostas: Object.keys(responses).length
  })
  
  if (!userId) {
    throw new Error('userId é obrigatório para salvar respostas do quiz')
  }
  
  const quizData = Object.entries(responses).map(([questionId, answer]) => {
    const question = questions[parseInt(questionId) - 1]
    return {
      user_id: userId,
      question_id: parseInt(questionId),
      question_text: question.question,
      answer: answer,
    }
  })

  const { data, error } = await supabase
    .from('quiz_responses')
    .upsert(quizData, { onConflict: 'user_id,question_id' })

  if (error) {
    console.error('❌ [saveQuizResponses] Erro ao salvar respostas:', {
      code: error.code,
      message: error.message,
      details: error.details,
      errorObject: JSON.stringify(error, null, 2)
    })
    throw error
  }
  
  console.log('✅ [saveQuizResponses] Respostas salvas com sucesso')
  return data
}

// Obter respostas do quiz do usuário
export async function getQuizResponses(userId: string) {
  const supabase = createSupabaseClient()
  
  if (!userId) {
    throw new Error('userId é obrigatório')
  }
  
  const { data, error } = await supabase
    .from('quiz_responses')
    .select('*')
    .eq('user_id', userId)
    .order('question_id')

  if (error) {
    console.error('❌ [getQuizResponses] Erro ao buscar respostas:', error)
    throw error
  }
  
  return data
}

// Criar atividade
export async function createActivity(userId: string, title: string, description: string, type: string) {
  const supabase = createSupabaseClient()
  
  console.log('🔵 [createActivity] Criando atividade:', {
    userId: userId?.substring(0, 8) + '...',
    title,
    type
  })
  
  if (!userId) {
    throw new Error('userId é obrigatório para criar atividade')
  }
  
  const { data, error } = await supabase
    .from('user_activities')
    .insert({
      user_id: userId,
      title,
      description,
      activity_type: type,
    })
    .select()
    .single()

  if (error) {
    console.error('❌ [createActivity] Erro ao criar atividade:', {
      code: error.code,
      message: error.message,
      details: error.details,
      errorObject: JSON.stringify(error, null, 2)
    })
    throw error
  }
  
  console.log('✅ [createActivity] Atividade criada com sucesso')
  return data
}

// Obter atividades do usuário
export async function getUserActivities(userId: string, limit = 10) {
  const supabase = createSupabaseClient()
  
  if (!userId) {
    throw new Error('userId é obrigatório')
  }
  
  const { data, error } = await supabase
    .from('user_activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('❌ [getUserActivities] Erro ao buscar atividades:', error)
    throw error
  }
  
  return data
}

// Obter todos os usuários (apenas admin)
export async function getAllUsers() {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ [getAllUsers] Erro ao buscar usuários:', error)
    throw error
  }
  
  return data
}

// Atualizar status de admin (função desabilitada - coluna não existe)
export async function updateAdminStatus(userId: string, isAdmin: boolean) {
  console.warn('⚠️ [updateAdminStatus] Função desabilitada - coluna is_admin não existe na tabela user_profiles')
  console.warn('💡 Para habilitar, adicione a coluna manualmente no Supabase: ALTER TABLE user_profiles ADD COLUMN is_admin boolean DEFAULT false;')
  throw new Error('Funcionalidade de admin não está disponível. Adicione a coluna is_admin à tabela user_profiles.')
}
