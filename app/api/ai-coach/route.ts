import { NextResponse } from 'next/server';

const fallbackAdvice = 'Попробуйте очистить верхние слои, чтобы открыть больше плиток.';

export async function POST(req: Request) {
  try {
    const { boardState, movesAvailable } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        advice: 'AI Coach сейчас недоступен. Сфокусируйтесь на внешних краях и верхних слоях.',
      });
    }

    const prompt = `You are a Zen Mahjong AI Coach.
The current board has ${boardState.tilesLeft} tiles left.
There are ${movesAvailable.length} possible moves right now.
Possible moves: ${JSON.stringify(movesAvailable.slice(0, 5))}...
Provide a short, meditative, and helpful piece of advice (max 2 sentences) in Russian.
Suggest which kind of tiles to focus on (e.g. bamboo, dots, characters, seasons, flowers) or where on the board (layers/sides).
Return only plain Russian text.
Do not add English.
Do not use quotes or markdown.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a helpful Zen Mahjong coach. Reply only in Russian, with calm and concise plain text.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      return NextResponse.json({ advice: fallbackAdvice });
    }

    const data = await response.json();
    const advice = data.choices?.[0]?.message?.content?.trim() || fallbackAdvice;

    return NextResponse.json({ advice });
  } catch (error) {
    console.error('AI Coach Error:', error);
    return NextResponse.json({ advice: fallbackAdvice });
  }
}
