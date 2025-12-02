import type { VercelRequest, VercelResponse } from '@vercel/node';

interface GenerateRequest {
  productName: string;
  type: 'short' | 'full';
  shortDescription?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productName, type, shortDescription } = req.body as GenerateRequest;

  if (!productName) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  if (!type || !['short', 'full'].includes(type)) {
    return res.status(400).json({ error: 'Type must be "short" or "full"' });
  }

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error('Missing Google Gemini API key in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const prompt = type === 'short' 
      ? generateShortPrompt(productName)
      : generateFullPrompt(productName, shortDescription);

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
          topP: 0.95,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Gemini API Error:', error);
      return res.status(response.status).json({ 
        error: 'Failed to generate description',
        details: error 
      });
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      return res.status(500).json({ error: 'No response generated' });
    }

    const generatedText = data.candidates[0].content.parts[0].text.trim();

    return res.status(200).json({ 
      description: generatedText,
      type 
    });

  } catch (error) {
    console.error('Error generating description:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function generateShortPrompt(productName: string): string {
  return `Crie uma descrição curta e atrativa de até 160 caracteres para este produto: "${productName}". 

A descrição deve:
- Ter entre 150-160 caracteres
- Ser otimizada para SEO
- Destacar o principal benefício do produto
- Ser persuasiva e clara
- Não usar emojis

Retorne apenas a descrição, sem aspas ou formatação extra.`;
}

function generateFullPrompt(productName: string, shortDescription?: string): string {
  const context = shortDescription ? `\nDescrição curta: ${shortDescription}` : '';
  
  return `Crie uma descrição completa e detalhada entre 300-500 caracteres para este produto: "${productName}".${context}

A descrição deve:
- Ter entre 300-500 caracteres
- Ser otimizada para SEO
- Incluir características principais do produto
- Destacar benefícios e diferenciais
- Usar linguagem persuasiva mas profissional
- Não usar emojis
- Incluir bullet points com • se necessário

Retorne apenas a descrição, sem aspas ou formatação extra.`;
}
