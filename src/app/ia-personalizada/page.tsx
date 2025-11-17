'use client';

import { useState, useEffect } from 'react';
import { Sprout, Leaf, Activity, Send, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface Insight {
  id: string;
  insight_type: string;
  title: string;
  message: string;
  progress_percentage: number;
}

interface Habit {
  id: string;
  habit_name: string;
  category: string;
  consistency_score: number;
}

export default function IAPersonalizadaPage() {
  const [message, setMessage] = useState('');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Carregar insights
      const { data: insightsData, error: insightsError } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (insightsError) throw insightsError;

      // Se não houver insights, criar um padrão
      if (!insightsData || insightsData.length === 0) {
        const { data: newInsight } = await supabase
          .from('ai_insights')
          .insert({
            user_id: user.id,
            insight_type: 'recommendation',
            title: 'Recomendações de Hoje',
            message: 'Percebi que seus últimos dias foram acelerados. Hoje, tente reservar 10 minutos para respirar e observar sua rotina com calma.',
            progress_percentage: 75
          })
          .select()
          .single();
        
        if (newInsight) setInsights([newInsight]);
      } else {
        setInsights(insightsData);
      }

      // Carregar hábitos
      const { data: habitsData, error: habitsError } = await supabase
        .from('user_habits')
        .select('*')
        .eq('user_id', user.id)
        .order('consistency_score', { ascending: false })
        .limit(2);

      if (habitsError) throw habitsError;

      // Se não houver hábitos, criar padrões
      if (!habitsData || habitsData.length === 0) {
        const defaultHabits = [
          {
            user_id: user.id,
            habit_name: 'Rotina',
            category: 'daily',
            consistency_score: 78
          },
          {
            user_id: user.id,
            habit_name: 'Equilíbrio',
            category: 'wellness',
            consistency_score: 82
          }
        ];

        const { data: newHabits } = await supabase
          .from('user_habits')
          .insert(defaultHabits)
          .select();
        
        if (newHabits) setHabits(newHabits);
      } else {
        setHabits(habitsData);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Você precisa estar logado para usar a IA');
        return;
      }

      // Salvar conversa
      const { error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          message: message,
          response: 'Obrigado por compartilhar! Estou analisando seus padrões e em breve terei insights personalizados para você.'
        });

      if (error) throw error;

      alert('Mensagem enviada! A IA está processando sua solicitação.');
      setMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const currentInsight = insights[0];
  const routineHabit = habits.find(h => h.category === 'daily') || habits[0];
  const balanceHabit = habits.find(h => h.category === 'wellness') || habits[1];

  return (
    <div className="min-h-screen bg-[#032712] p-6 pb-32">
      {/* Header Section */}
      <div className="mb-8 pt-4 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Sprout className="w-12 h-12 text-[#E8DBBE]" strokeWidth={1.5} />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#4ADE80] rounded-full animate-pulse shadow-lg shadow-[#4ADE80]/50"></div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-[#E8DBBE] mb-2">
          IA Personalizada
        </h1>
        <p className="text-[#E8DBBE] opacity-70 text-sm">
          Sua evolução guiada pela inteligência da raiz
        </p>
      </div>

      {/* Main AI Avatar */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-[#4ADE80] rounded-full blur-3xl opacity-20 animate-pulse"></div>
          
          {/* Avatar container */}
          <div className="relative w-32 h-32 bg-gradient-to-br from-[#4ADE80] to-[#22C55E] rounded-full flex items-center justify-center shadow-2xl shadow-[#4ADE80]/30">
            <div className="w-28 h-28 bg-[#032712] rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-[#4ADE80]" strokeWidth={1.5} />
            </div>
          </div>
          
          {/* Orbital ring */}
          <div className="absolute inset-0 border-2 border-[#4ADE80] border-opacity-30 rounded-full animate-spin" style={{ animationDuration: '8s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#4ADE80] rounded-full shadow-lg shadow-[#4ADE80]/50"></div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-[#E8DBBE] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#E8DBBE] mt-4 opacity-70">Carregando insights...</p>
        </div>
      ) : (
        <>
          {/* AI Recommendation Card */}
          {currentInsight && (
            <div className="bg-[#E8DBBE] rounded-3xl p-6 shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-[#032712] mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#4ADE80]" strokeWidth={2} />
                {currentInsight.title}
              </h3>
              <p className="text-[#032712] opacity-80 text-sm leading-relaxed mb-4">
                {currentInsight.message}
              </p>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-[#032712] bg-opacity-10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#4ADE80] to-[#22C55E] rounded-full shadow-lg shadow-[#4ADE80]/30"
                    style={{ width: `${currentInsight.progress_percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-[#032712] opacity-60">
                  {currentInsight.progress_percentage}%
                </span>
              </div>
            </div>
          )}

          {/* Habit Insights Section */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Card 1: Rotina */}
            {routineHabit && (
              <div className="bg-[#E8DBBE] rounded-3xl p-5 shadow-lg">
                <div className="bg-[#032712] bg-opacity-10 w-12 h-12 rounded-2xl flex items-center justify-center mb-3">
                  <Leaf className="w-6 h-6 text-[#032712]" strokeWidth={1.5} />
                </div>
                <h4 className="text-sm font-semibold text-[#032712] mb-2">
                  {routineHabit.habit_name}
                </h4>
                <p className="text-xs text-[#032712] opacity-70 leading-relaxed">
                  Seu nível de constância está em {routineHabit.consistency_score}%.
                </p>
              </div>
            )}

            {/* Card 2: Equilíbrio */}
            {balanceHabit && (
              <div className="bg-[#E8DBBE] rounded-3xl p-5 shadow-lg">
                <div className="bg-[#032712] bg-opacity-10 w-12 h-12 rounded-2xl flex items-center justify-center mb-3">
                  <Activity className="w-6 h-6 text-[#032712]" strokeWidth={1.5} />
                </div>
                <h4 className="text-sm font-semibold text-[#032712] mb-2">
                  {balanceHabit.habit_name}
                </h4>
                <p className="text-xs text-[#032712] opacity-70 leading-relaxed">
                  Seu padrão está {balanceHabit.consistency_score}% estável.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Interactive AI Input Box - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#032712] via-[#032712] to-transparent">
        <div className="bg-[#E8DBBE] rounded-full p-2 shadow-2xl mb-4 flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte algo para a IA…"
            disabled={sending}
            className="flex-1 bg-transparent px-4 py-3 text-[#032712] placeholder-[#032712] placeholder-opacity-50 outline-none text-sm disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="bg-[#032712] p-3 rounded-full hover:scale-110 active:scale-95 transition-transform duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-[#E8DBBE]" strokeWidth={2} />
          </button>
        </div>

        {/* Footer Button */}
        <button className="w-full bg-[#032712] text-[#E8DBBE] rounded-full py-4 px-6 shadow-2xl hover:shadow-[0_0_30px_rgba(74,222,128,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-semibold border-2 border-[#4ADE80] border-opacity-30 relative overflow-hidden group">
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4ADE80] to-transparent opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
          <span className="relative">Explorar mais insights</span>
        </button>
      </div>
    </div>
  );
}
