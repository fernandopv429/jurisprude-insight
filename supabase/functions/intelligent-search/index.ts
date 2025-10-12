import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// --- CONSTANTES DA API ---
const SCRAPER_API_URL = 'http://72.60.61.18:5001/api/search';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const LIMITE_EMENTAS_SEARCH = 100;

// --- CORS Headers ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- FUNÇÕES DA OPENAI (TRADUZIDAS DO PYTHON) ---
async function generateKeywords(query: string): Promise<string[]> {
  try {
    console.log('Gerando palavras-chave para:', query);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente de IA especialista em direito brasileiro. Sua tarefa é, a partir de uma consulta do usuário, gerar uma lista de até 5 palavras-chave ou frases de busca alternativas para encontrar jurisprudência relevante. Retorne a resposta como uma lista JSON. Exemplo de saída: ["termo 1", "termo 2"]`,
          },
          { role: 'user', content: query },
        ],
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Erro na OpenAI:', response.status, error);
      return [query];
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (content) {
      console.log('Resposta da OpenAI para keywords:', content);
      // Tenta extrair a lista do conteúdo
      const match = content.match(/\[.*?\]/);
      if (match) {
        const keywords = JSON.parse(match[0].replace(/'/g, '"'));
        console.log('Palavras-chave geradas:', keywords);
        return keywords;
      }
    }
    return [query]; // Retorna a query original em caso de falha
  } catch (error) {
    console.error('Erro ao gerar keywords:', error);
    return [query]; // Retorna a query original em caso de erro
  }
}

async function findRelevantEmentas(
  ementas: any[],
  originalQuery: string,
  limit: number
): Promise<any[]> {
  try {
    console.log(`Analisando ${ementas.length} ementas para encontrar as ${limit} mais relevantes`);
    const ementasText = ementas
      .map((ementa, index) => `Ementa ${index}:\n${ementa.ementa}\n---`)
      .join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente de IA especialista em direito brasileiro. Analise a consulta do usuário e a lista de ementas fornecidas. Retorne uma lista JSON contendo os índices (e APENAS os índices) das ${limit} ementas mais relevantes para a consulta. A ementa mais relevante deve vir primeiro. Exemplo de saída: [índice_mais_relevante, outro_índice, ...]`,
          },
          {
            role: 'user',
            content: `Consulta: "${originalQuery}"\n\n${ementasText}`,
          },
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Erro na OpenAI:', response.status, error);
      return ementas.slice(0, limit);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (content) {
      console.log('Resposta da OpenAI para relevância:', content);
      const match = content.match(/\[.*?\]/);
      if (match) {
        const indexes = JSON.parse(match[0]) as number[];
        console.log('Índices das ementas relevantes:', indexes);
        return indexes.map((i) => ementas[i]).filter(Boolean); // Retorna as ementas na ordem de relevância
      }
    }
    return ementas.slice(0, limit); // Retorna as primeiras em caso de falha
  } catch (error) {
    console.error('Erro ao encontrar ementas relevantes:', error);
    return ementas.slice(0, limit); // Retorna as primeiras em caso de erro
  }
}

// --- FUNÇÃO PARA CHAMAR A API DE SCRAPING ---
async function searchApi(query: string, tribunal: string[] | null, limit: number) {
  try {
    console.log(`Chamando API de scraping: query="${query}", tribunal=${JSON.stringify(tribunal)}, limit=${limit}`);
    const response = await fetch(SCRAPER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        limitentries: limit,
        tribunal: tribunal,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Erro na API de scraping: ${response.status} ${response.statusText}`, error);
      throw new Error(`Erro na API de scraping: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`API retornou ${data.dado?.length || 0} resultados`);
    return data.dado || [];
  } catch (error) {
    console.error('Erro ao chamar a API de scraping:', error);
    return [];
  }
}

// --- SERVIDOR DA FUNÇÃO ---
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, tribunais } = await req.json();
    
    if (!query) {
      return new Response(JSON.stringify({ error: 'A consulta é obrigatória' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('=== INÍCIO DA BUSCA INTELIGENTE ===');
    console.log('Query:', query);
    console.log('Tribunais:', tribunais);

    // 1. Gerar palavras-chave com a OpenAI
    const keywords = await generateKeywords(query);
    console.log('Keywords geradas:', keywords);

    // 2. Chamar a API de scraping para cada palavra-chave
    let fullData: any[] = [];
    const limitPerKeyword = Math.ceil(LIMITE_EMENTAS_SEARCH / keywords.length);

    for (const keyword of keywords) {
      const results = await searchApi(keyword, tribunais, limitPerKeyword);
      fullData = fullData.concat(results);
    }

    console.log(`Total de resultados coletados: ${fullData.length}`);

    // Remover duplicados e filtrar itens sem conteúdo
    const uniqueData = Array.from(new Map(fullData.map((item) => [item.uuid, item])).values());
    console.log(`Após remover duplicados: ${uniqueData.length}`);
    
    const cleanedData = uniqueData.map((item) => item.conteudo).filter((item) => item && item.ementa);
    console.log(`Após limpeza: ${cleanedData.length}`);

    if (cleanedData.length === 0) {
      console.log('Nenhum resultado encontrado');
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Usar a OpenAI para encontrar as ementas mais relevantes
    const relevantEmentas = await findRelevantEmentas(cleanedData, query, 10);
    console.log(`Ementas relevantes selecionadas: ${relevantEmentas.length}`);
    console.log('=== FIM DA BUSCA INTELIGENTE ===');

    return new Response(JSON.stringify(relevantEmentas), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na função intelligent-search:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
