'use client';

import { useEffect, useState } from 'react';
import { Users, BarChart3, MessageSquare, CreditCard, Palette, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Statistics {
  total_users: number;
  active_users: number;
  premium_users: number;
  total_habits_tracked: number;
  total_ai_interactions: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('app_statistics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminSections = [
    {
      icon: Users,
      title: 'Gerenciar usuários',
      description: `${stats?.total_users?.toLocaleString() || '...'} usuários cadastrados`,
      value: stats?.total_users
    },
    {
      icon: BarChart3,
      title: 'Estatísticas do App',
      description: `${stats?.active_users?.toLocaleString() || '...'} usuários ativos`,
      value: stats?.active_users
    },
    {
      icon: MessageSquare,
      title: 'Mensagens e anúncios',
      description: `${stats?.total_ai_interactions?.toLocaleString() || '...'} interações com IA`,
      value: stats?.total_ai_interactions
    },
    {
      icon: CreditCard,
      title: 'Controle de planos e assinaturas',
      description: `${stats?.premium_users?.toLocaleString() || '...'} assinantes premium`,
      value: stats?.premium_users
    },
    {
      icon: Palette,
      title: 'Personalização de temas',
      description: 'Configure cores e aparência'
    }
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#032712] p-6 pb-24">
      {/* Header */}
      <div className="mb-8 pt-4">
        <h1 className="text-3xl font-bold text-[#E8DBBE] mb-2">
          Configurações Administrativas
        </h1>
        <div className="h-1 w-16 bg-[#E8DBBE] rounded-full opacity-60"></div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-[#E8DBBE] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#E8DBBE] mt-4 opacity-70">Carregando estatísticas...</p>
        </div>
      )}

      {/* Admin Section Cards */}
      {!loading && (
        <div className="space-y-4 mb-8">
          {adminSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <button
                key={index}
                className="w-full bg-[#E8DBBE] rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-[#032712] bg-opacity-10 p-3 rounded-2xl">
                    <Icon className="w-6 h-6 text-[#032712]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#032712] mb-1">
                      {section.title}
                    </h3>
                    <p className="text-sm text-[#032712] opacity-70">
                      {section.description}
                    </p>
                  </div>
                  {section.value && (
                    <div className="text-2xl font-bold text-[#032712] opacity-80">
                      {section.value.toLocaleString()}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Logout Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#032712] via-[#032712] to-transparent">
        <button
          onClick={handleLogout}
          className="w-full bg-[#032712] text-[#E8DBBE] rounded-full py-4 px-6 shadow-2xl hover:shadow-[0_0_30px_rgba(232,219,190,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 font-semibold border-2 border-[#E8DBBE] border-opacity-20"
        >
          <LogOut className="w-5 h-5" strokeWidth={2} />
          Sair da conta
        </button>
      </div>
    </div>
  );
}
