import fs from 'fs';
import path from 'path';

// Load .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [k, ...v] = trimmed.split('=');
      if (!process.env[k.trim()]) {
        process.env[k.trim()] = v.join('=').trim();
      }
    }
  }
}

import { runIngestion, runConceptExtraction, runStorySynthesis, runCharacterDesign, runStoryboardGeneration } from '../lib/manga-engine/pipeline';
import { generateQuizForChapter } from '../lib/manga-engine/quiz-generator';

async function testLivePipeline() {
  console.log('🚀 TESTING LIVE INKPATH ENGINE WITH REAL GEMINI API KEY...');
  const apiKey = process.env.GEMINI_PLATFORM_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_PLATFORM_KEY missing in .env');
  }

  // 1. Ingestion
  console.log('\n--- 1. Ingesting Curriculum Topic ---');
  const ingested = await runIngestion({
    type: 'topic',
    rawContent: 'Calculus: Fundamental Theorem of Calculus and Derivatives',
  });
  console.log('Ingested Title:', ingested.title);
  console.log('Cleaned Text Preview:', ingested.cleanedText.substring(0, 80) + '...');

  const ctx = {
    mangaId: 'live-test',
    chapterId: 'ch-01',
    sourceType: 'topic',
    sourceTitle: 'Calculus: Fundamental Theorem',
    sourceContent: ingested.cleanedText,
    genre: 'sci_fi',
    pedagogicalRigor: 'balanced',
    provider: 'gemini' as const,
    apiKey,
  };

  // 2. Concept Extraction
  console.log('\n--- 2. Extracting Academic Concepts with Gemini ---');
  const concepts = await runConceptExtraction(ctx);
  console.log(`Extracted ${concepts.length} concepts:`);
  concepts.forEach(c => console.log(`  - ${c.term}: ${c.formulaLatex || 'No formula'}`));

  // 3. Story Synthesis
  console.log('\n--- 3. Synthesizing Manhwa Story with Gemini ---');
  const story = await runStorySynthesis(ctx, concepts);
  console.log('Story Title:', story.title);
  console.log('Genre:', story.recommendedGenre);
  console.log('Synopsis:', story.synopsis);

  // 4. Character Design
  console.log('\n--- 4. Designing Manhwa Characters with Gemini ---');
  const chars = await runCharacterDesign(ctx, story);
  console.log(`Designed ${chars.length} characters:`);
  chars.forEach(c => console.log(`  - ${c.name} (${c.koreanName}): ${c.archetype}`));

  // 5. Storyboard Generation
  console.log('\n--- 5. Generating 9:16 Panels & Decoupled Balloons ---');
  const panels = await runStoryboardGeneration(ctx, 1, concepts, chars);
  console.log(`Generated ${panels.length} panels.`);
  if (panels[0]) {
    console.log('Panel 1 prompt:', panels[0].scenePrompt?.substring(0, 80) + '...');
    console.log('Panel 1 balloons count:', panels[0].balloons?.length);
  }

  // 6. Boss Battle Quiz Generation
  console.log('\n--- 6. Generating Boss Battle Quiz with Gemini ---');
  const quiz = await generateQuizForChapter({
    concepts,
    chapterTitle: story.title,
    genre: story.recommendedGenre,
    provider: 'gemini',
    apiKey,
  });
  console.log(`Generated ${quiz.length} quiz questions.`);
  if (quiz[0]) {
    console.log('Q1 Question:', quiz[0].question);
    console.log('Q1 Options count:', quiz[0].options?.length);
    console.log('Q1 Correct option index:', quiz[0].correctIndex);
  }

  console.log('\n🎉 ALL LIVE GEMINI ENGINE STEPS PASSED SUCCESSFULLY!');
}

testLivePipeline().catch(e => {
  console.error('Live test failed:', e);
  process.exit(1);
});

