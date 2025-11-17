'use client'

import { Check, Star, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PromoScreen() {
  const [showPromo, setShowPromo] = useState(true)
  const [stats, setStats] = useState({ total_users: 12547, premium_users: 3421 })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data } = await supabase
        .from('app_statistics')
        .select('total_users, premium_users')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleStartTrial = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('Você precisa estar logado para iniciar o teste grátis')
        router.push('/')
        return
      }

      // Atualizar perfil do usuário para premium trial
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 7)

      const { error } = await supabase
        .from('user_profiles')
        .update({
          subscription_status: 'trial',
          subscription_end_date: trialEndDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      alert('🎉 Teste grátis de 7 dias ativado com sucesso!')
      setShowPromo(false)
    } catch (error) {
      console.error('Erro ao ativar teste:', error)
      alert('Erro ao ativar teste. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!showPromo) return null

  const totalUsersFormatted = stats.total_users.toLocaleString('pt-BR')
  const reviewsCount = Math.floor(stats.total_users * 0.88).toLocaleString('pt-BR')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#032712] rounded-3xl shadow-2xl relative my-8">
        {/* Botão Fechar */}
        <button
          onClick={() => setShowPromo(false)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Conteúdo do Pop-up */}
        <div className="px-6 py-8">
          {/* Título Principal */}
          <h1 className="text-3xl font-bold text-[#E8DBBE] text-center mb-8 leading-tight">
            Milhares de Pessoas Já Começaram Sua Jornada com o RaizApp.
          </h1>

          {/* Checklist de Benefícios */}
          <div className="space-y-3 mb-8">
            {[
              'Clareza na sua rotina',
              'Identifique seus hábitos',
              'Acompanhe sua evolução com IA',
              'Comunidade acolhedora',
              'Motivação diária personalizada',
              'Privacidade total com Face ID'
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#2d5a3d] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-[#E8DBBE]" strokeWidth={3} />
                </div>
                <p className="text-[#E8DBBE] text-base leading-relaxed font-medium">
                  {benefit}
                </p>
              </div>
            ))}
          </div>

          {/* Hero Image */}
          <div className="bg-[#E8DBBE] rounded-2xl overflow-hidden mb-8 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&h=400&fit=crop"
              alt="Pessoa sorrindo em ambiente natural"
              className="w-full h-64 object-cover"
            />
          </div>

          {/* Seção de Avaliações */}
          <div className="mb-8">
            <p className="text-[#E8DBBE] text-center font-semibold text-lg mb-4">
              {reviewsCount}+ avaliações positivas
            </p>
            
            <div className="space-y-3">
              {[
                {
                  text: 'O RaizApp mudou completamente minha rotina. Agora consigo identificar padrões e melhorar cada dia.',
                  author: 'Maria S.'
                },
                {
                  text: 'Incrível como a IA me ajuda a entender meus hábitos. Recomendo para todos que buscam autoconhecimento.',
                  author: 'João P.'
                }
              ].map((review, i) => (
                <div key={i} className="bg-[#E8DBBE] rounded-xl p-4">
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star key={starIndex} className="w-4 h-4 fill-[#032712] text-[#032712]" />
                    ))}
                  </div>
                  <p className="text-[#032712] text-sm mb-2 leading-relaxed">
                    "{review.text}"
                  </p>
                  <p className="text-[#032712]/60 text-xs font-medium">
                    — {review.author}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mensagem do Meio */}
          <div className="text-center mb-8">
            <p className="text-[#E8DBBE] text-xl font-bold leading-tight">
              Mais de {totalUsersFormatted} Pessoas Já Se Conectaram com Suas Raízes.
            </p>
          </div>

          {/* Box de Plano */}
          <div className="bg-[#E8DBBE] rounded-2xl p-6 mb-6 shadow-lg">
            <p className="text-[#032712] text-lg font-bold text-center mb-2">
              Veja todos os planos
            </p>
            <p className="text-[#032712]/70 text-center text-sm">
              7 dias grátis, depois R$ 19,99/ano
            </p>
          </div>

          {/* Botão CTA Principal */}
          <button 
            onClick={handleStartTrial}
            disabled={loading}
            className="w-full bg-[#032712] text-white py-4 rounded-full font-bold text-lg shadow-xl hover:bg-[#054a1f] transition-all transform hover:scale-[1.02] active:scale-[0.98] mb-6 border-2 border-[#E8DBBE]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ativando...' : 'Iniciar teste grátis de 7 dias'}
          </button>

          {/* Footer Links */}
          <div className="flex items-center justify-center gap-3 text-xs text-[#E8DBBE]/60">
            <button className="hover:text-[#E8DBBE] transition-colors">
              Política de Privacidade
            </button>
            <span>|</span>
            <button className="hover:text-[#E8DBBE] transition-colors">
              Termos de Uso
            </button>
            <span>|</span>
            <button className="hover:text-[#E8DBBE] transition-colors">
              Restaurar Compras
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
