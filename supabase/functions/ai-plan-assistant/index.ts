import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { action, context } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "analyze_campaign":
        systemPrompt = "Você é um especialista em marketing digital, AdSense/ADX e Meta Ads. Analise os dados da campanha e dê sugestões práticas e objetivas em português. Foque em ROI, CPA, CTR e otimizações. Responda em markdown.";
        userPrompt = `Analise esta campanha e dê sugestões de melhoria:\n\n${JSON.stringify(context, null, 2)}`;
        break;

      case "analyze_content":
        systemPrompt = "Você é um especialista em SEO e conteúdo para monetização com AdSense. Analise o desempenho do conteúdo/artigo e sugira melhorias práticas. Responda em português e em markdown.";
        userPrompt = `Analise o desempenho deste conteúdo e sugira melhorias:\n\n${JSON.stringify(context, null, 2)}`;
        break;

      case "creative_ideas":
        systemPrompt = "Você é um expert em criativos para Meta Ads e tráfego pago. Gere ideias de criativos (imagens, headlines, copy) para campanhas. Responda em português e em markdown com listas práticas.";
        userPrompt = `Gere ideias de criativos para esta campanha:\n\nNicho: ${context.niche}\nTema: ${context.topic}\nObjetivo: ${context.goal}\nPúblico: ${context.audience || 'Geral'}\nObservações: ${context.extra || 'Nenhuma'}`;
        break;

      case "roi_suggestions":
        systemPrompt = "Você é um consultor de performance digital focado em AdSense/ADX. Com base nos dados de ROI, identifique gargalos e dê um plano de ação claro para melhorar o retorno. Responda em português e em markdown.";
        userPrompt = `Com base nestes dados de ROI, sugira melhorias:\n\n${JSON.stringify(context, null, 2)}`;
        break;

      case "generate_plan":
        systemPrompt = "Você é um estrategista digital especialista em criar planos de ação para projetos de monetização com AdSense/ADX. Crie planos detalhados com fases, checklists e KPIs. Responda em português e em markdown.";
        userPrompt = `Crie um plano de ação completo para este projeto:\n\nNicho: ${context.niche}\nTema: ${context.topic}\nPaís: ${context.country}\nIdioma: ${context.language}\nObjetivo: ${context.goal}\nDias do sprint: ${context.sprintDays}\nObservações: ${context.extra || 'Nenhuma'}`;
        break;

      case "phase_help":
        systemPrompt = "Você é um mentor de marketing digital. Ajude o usuário com a fase atual do plano de ação, dando dicas práticas, exemplos e próximos passos. Responda em português e em markdown.";
        userPrompt = `Preciso de ajuda com esta fase do meu plano:\n\nFase: ${context.phaseTitle}\nDescrição: ${context.phaseSubtitle}\nNicho: ${context.niche}\nTema: ${context.topic}\nNotas atuais: ${context.notes || 'Nenhuma'}\nPergunta/Pedido: ${context.question || 'Dê dicas práticas para esta fase.'}`;
        break;

      default:
        return new Response(JSON.stringify({ error: "Ação inválida" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-plan-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
