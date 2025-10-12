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

// --- FUNÇÕES DE EMBEDDINGS E SIMILARIDADE ---
async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Erro ao gerar embedding:', response.status, error);
      throw new Error('Falha ao gerar embedding');
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Erro ao gerar embedding:', error);
    throw error;
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

async function rankEmentasBySimilarity(
  query: string,
  ementas: any[],
  limit: number
): Promise<any[]> {
  try {
    console.log(`Calculando similaridade para ${ementas.length} ementas`);
    
    // Calcular embedding da query
    const queryEmbedding = await getEmbedding(query);
    
    // Calcular embeddings e similaridades para cada ementa
    const ementasWithScores = await Promise.all(
      ementas.map(async (ementa) => {
        const ementaEmbedding = await getEmbedding(ementa.ementa);
        const similarity = cosineSimilarity(queryEmbedding, ementaEmbedding);
        return { ...ementa, similarity };
      })
    );
    
    // Ordenar por similaridade (maior primeiro) e retornar top N
    const ranked = ementasWithScores
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    console.log(`Top ${limit} ementas selecionadas com similaridades:`, 
      ranked.map(e => e.similarity.toFixed(4)));
    
    return ranked;
  } catch (error) {
    console.error('Erro ao calcular similaridade:', error);
    // Em caso de erro, retorna as primeiras ementas
    return ementas.slice(0, limit);
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

    // 1. Buscar até 100 ementas com a query original
    const results = await searchApi(query, tribunais, LIMITE_EMENTAS_SEARCH);
    console.log(`Total de resultados coletados: ${results.length}`);

    // 2. Remover duplicados e filtrar itens sem conteúdo
    const uniqueData = Array.from(new Map(results.map((item) => [item.uuid, item])).values());
    console.log(`Após remover duplicados: ${uniqueData.length}`);
    
    const cleanedData = uniqueData.map((item) => item.conteudo).filter((item) => item && item.ementa);
    console.log(`Após limpeza: ${cleanedData.length}`);

    if (cleanedData.length === 0) {
      console.log('Nenhum resultado encontrado');
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Usar embeddings semânticos para ranquear as ementas por similaridade
    const relevantEmentas = await rankEmentasBySimilarity(query, cleanedData, 10);
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
