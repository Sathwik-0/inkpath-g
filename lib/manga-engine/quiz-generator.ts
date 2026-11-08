import { generateTextWithProvider } from '@/lib/ai-gateway';
import { SupportedProvider } from '@/lib/ai-gateway/config';
import { ConceptItem } from './pipeline';

export interface QuizQuestion {
  id: string;
  conceptId?: string;
  question: string;
  equationPrompt?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  bossScenario?: string;
}

export async function generateQuizForChapter(opts: {
  concepts: ConceptItem[];
  chapterTitle: string;
  genre: string;
  provider: SupportedProvider;
  apiKey: string;
}): Promise<QuizQuestion[]> {
  const { concepts, chapterTitle, genre, provider, apiKey } = opts;

  const conceptSummaries = concepts.map(c => `- ${c.term}: ${c.derivationSnippet} (Formula: ${c.formulaLatex || 'N/A'})`).join('\n');

  const prompt = `You are a manhwa game master and academic examiner.
Create an epic 3-question "Boss Battle Quiz" for the chapter "${chapterTitle}" (Genre: ${genre}).
The questions test the student's understanding of these core concepts:
${conceptSummaries}

Rules:
- Each question must be rigorous and test deep conceptual or mathematical reasoning.
- Provide 4 distinct options (A, B, C, D).
- Specify the 0-based index of the correct answer (0, 1, 2, or 3).
- Include a 2-sentence explanation of why the correct option is true physically or logically.
- Include a dramatic manhwa scenario prompt (e.g. "The dungeon gate destabilizes as entropy accelerates! To balance the field...")
- Return STRICT JSON array matching this format:

[
  {
    "id": "q1",
    "conceptId": "${concepts[0]?.id || 'concept-01'}",
    "bossScenario": "The Shadow Archmage casts a wavepacket collapse spell. Which condition guarantees minimum uncertainty?",
    "question": "Under what condition is the equality in Heisenberg's Uncertainty Principle (\\Delta x \\Delta p = \\frac{\\hbar}{2}) strictly achieved?",
    "equationPrompt": "\\Delta x \\Delta p \\ge \\frac{\\hbar}{2}",
    "options": [
      "When the wavepacket is a Gaussian minimum uncertainty state",
      "When the particle's kinetic energy is zero",
      "In any arbitrary sinusoidal plane wave state",
      "Only when momentum is infinite"
    ],
    "correctIndex": 0,
    "explanation": "Gaussian wavepackets uniquely satisfy the equality in the Heisenberg relation by minimizing the product of position and momentum standard deviations."
  }
]`;

  try {
    const jsonText = await generateTextWithProvider({
      provider,
      apiKey,
      userPrompt: prompt,
      responseJsonSchema: true,
    });

    const parsed = JSON.parse(jsonText);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err: any) {
    console.warn('Failed to parse AI quiz response, using fallback questions:', err.message);
  }

  // Graceful fallback questions based on provided concepts
  return concepts.slice(0, 3).map((concept, idx) => ({
    id: `q-${idx + 1}`,
    conceptId: concept.id,
    bossScenario: `A high-rank anomalous gate opens in Neo-Seoul. Master the fundamental law of ${concept.term} to disrupt the core!`,
    question: `What fundamental principle governs ${concept.term}?`,
    equationPrompt: concept.formulaLatex || undefined,
    options: [
      concept.derivationSnippet,
      `The inverse rate of change in an isolated system without ${concept.term}`,
      `Total stochastic disruption of quantum equilibrium`,
      `Static adiabatic compression with zero energy flux`
    ],
    correctIndex: 0,
    explanation: `${concept.term}: ${concept.derivationSnippet}`
  }));
}

