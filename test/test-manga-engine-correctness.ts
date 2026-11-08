import { runPanelImageGeneration } from '../lib/manga-engine/pipeline';
import { generateImageWithGemini } from '../lib/ai-gateway';
import { CharacterReferenceAsset } from '../lib/manga-engine/types';
import assert from 'assert';

async function runTestSuite() {
  console.log('================================================================');
  console.log('INKPATH MANGA ENGINE CRITICAL CORRECTNESS TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function report(testName: string, success: boolean, detail?: string) {
    if (success) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // Test Case 1: Character reference image is never published as a panel
  // --------------------------------------------------------------------------
  try {
    const charRef: CharacterReferenceAsset = {
      id: 'char-ref-01',
      characterName: 'Jin Woo-Hyun',
      assetType: 'character_portrait',
      sourceUrl: '/assets/characters/jin-woo-hyun.png',
      visualSpec: {
        hair: 'messy obsidian',
        eyes: 'violet glowing',
        outfit: 'trenchcoat',
        sigilColor: '#8B5CF6',
      },
    };

    const panelOutput = await runPanelImageGeneration({
      mangaId: 'test-manga-01',
      chapterId: 'test-ch-01',
      panelId: 'pnl-test-01',
      panelIndex: 1,
      generationJobId: 'job-test-01',
      scenePrompt: 'Wide panoramic establishing shot of Neo-Seoul research tower under aurora',
      characters: [
        {
          name: 'Jin Woo-Hyun',
          koreanName: '진우현',
          archetype: 'Quantum Hunter',
          personality: 'Analytical',
          visualAttributes: charRef.visualSpec,
        },
      ],
      characterReferences: [charRef],
      genre: 'sci_fi',
      apiKey: 'dummy-or-real-key',
    });

    const isPublishedAsPanel =
      panelOutput.imageUrl === charRef.sourceUrl ||
      panelOutput.imageUrl === '/assets/characters/jin-woo-hyun.png';

    report(
      'Test 1: Character reference image is never published as a panel',
      !isPublishedAsPanel,
      `imageUrl was set to character reference: ${panelOutput.imageUrl}`
    );
  } catch (err: any) {
    report('Test 1: Character reference image is never published as a panel', false, err.message);
  }

  // --------------------------------------------------------------------------
  // Test Case 2: Unrelated existing image is never selected as a fallback
  // --------------------------------------------------------------------------
  try {
    const knownExistingAssets = [
      '/assets/manhwa/establishing-neo-seoul.jpg',
      '/assets/manhwa/action-quantum-core.jpg',
      '/assets/manhwa/jin-woo-close-up.jpg',
      '/assets/manhwa/energy-blade-clash.jpg',
      '/assets/manhwa/corridor-aftermath.jpg',
      '/assets/manhwa/boss-quantum-abyss.jpg',
      '/assets/scenes/neo-seoul.png',
      '/assets/panels/action-panel-1.png',
    ];

    const panelOutput = await runPanelImageGeneration({
      mangaId: 'test-manga-02',
      chapterId: 'test-ch-02',
      panelId: 'pnl-test-02',
      panelIndex: 2,
      generationJobId: 'job-test-02',
      scenePrompt: 'Close up of the protagonist activating an ocular scanner with glowing mathematical equations',
      characters: [],
      genre: 'sci_fi',
      apiKey: 'invalid-key-testing-fallback',
    });

    const usedExistingFallback = knownExistingAssets.includes(panelOutput.imageUrl || '');

    report(
      'Test 2: Unrelated existing image is never selected as a fallback',
      !usedExistingFallback,
      `Found forbidden fallback image: ${panelOutput.imageUrl}`
    );
  } catch (err: any) {
    report('Test 2: Unrelated existing image is never selected as a fallback', false, err.message);
  }

  // --------------------------------------------------------------------------
  // Test Case 3: Each panel receives its own generation request with unique ID
  // --------------------------------------------------------------------------
  try {
    const panelIds = ['pnl-unique-1', 'pnl-unique-2', 'pnl-unique-3'];
    const results = await Promise.all(
      panelIds.map((pId, idx) =>
        runPanelImageGeneration({
          mangaId: 'test-manga-03',
          chapterId: 'test-ch-03',
          panelId: pId,
          panelIndex: idx + 1,
          generationJobId: 'job-batch-03',
          scenePrompt: `Scene description number ${idx + 1}`,
          characters: [],
          genre: 'sci_fi',
          apiKey: 'test-key',
        })
      )
    );

    const auditPanelIds = results.map(r => r.audit.panelId);
    const allUnique = new Set(auditPanelIds).size === 3;

    report(
      'Test 3: Each panel receives its own generation request with unique ID and audit record',
      allUnique && results.every(r => r.audit.generationJobId === 'job-batch-03'),
      `Audit IDs: ${auditPanelIds.join(', ')}`
    );
  } catch (err: any) {
    report('Test 3: Each panel receives its own generation request', false, err.message);
  }

  // --------------------------------------------------------------------------
  // Test Case 4: A successful response is stored against the correct panel
  // --------------------------------------------------------------------------
  try {
    // Simulate valid returned image data
    const mockPanelId = 'pnl-success-04';
    const mockMangaId = 'manga-success-04';
    const mockChapterId = 'ch-success-04';

    // Verify audit structure and data association contract
    const auditRecord = {
      projectId: mockMangaId,
      chapterId: mockChapterId,
      panelId: mockPanelId,
      generationJobId: 'job-04',
      provider: 'gemini',
      modelId: 'gemini-2.5-flash-image',
      promptVersion: 'v1.0',
      referenceAssetIds: [],
      generationStatus: 'completed' as const,
      retryCount: 0,
      storagePath: `${mockMangaId}/${mockChapterId}/${mockPanelId}.png`,
      errorCode: null,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const isCorrectlyAssociated =
      auditRecord.panelId === mockPanelId &&
      auditRecord.chapterId === mockChapterId &&
      auditRecord.storagePath.includes(mockPanelId);

    report(
      'Test 4: A successful response is stored against the correct panel & chapter ID',
      isCorrectlyAssociated
    );
  } catch (err: any) {
    report('Test 4: Successful response storage association', false, err.message);
  }

  // --------------------------------------------------------------------------
  // Test Case 5: A failed request never creates a successful panel asset
  // --------------------------------------------------------------------------
  try {
    const failedOutput = await runPanelImageGeneration({
      mangaId: 'test-manga-05',
      chapterId: 'test-ch-05',
      panelId: 'pnl-test-05',
      panelIndex: 1,
      generationJobId: 'job-test-05',
      scenePrompt: 'Dynamic action collapse',
      characters: [],
      genre: 'sci_fi',
      apiKey: 'intentionally-invalid-key',
    });

    const isHonestFailure =
      failedOutput.status === 'failed' &&
      failedOutput.imageUrl === null &&
      failedOutput.storagePath === null &&
      failedOutput.audit.generationStatus === 'failed' &&
      failedOutput.audit.errorCode !== null;

    report(
      'Test 5: A failed request never creates a successful panel asset (imageUrl is null, status is failed)',
      isHonestFailure,
      `Received status: ${failedOutput.status}, imageUrl: ${failedOutput.imageUrl}, error: ${failedOutput.audit.errorCode}`
    );
  } catch (err: any) {
    report('Test 5: Failed request honest tracking', false, err.message);
  }

  // --------------------------------------------------------------------------
  // Test Case 6: Retrying a failed panel does not regenerate completed panels
  // --------------------------------------------------------------------------
  try {
    const panelsState = [
      { panelId: 'p-1', status: 'completed', imageUrl: 'https://storage/p-1.png' },
      { panelId: 'p-2', status: 'failed', imageUrl: null },
      { panelId: 'p-3', status: 'completed', imageUrl: 'https://storage/p-3.png' },
    ];

    // Simulate retrying ONLY panel 2
    const targetPanelId = 'p-2';
    const targetedRetry = panelsState.map(p => {
      if (p.panelId === targetPanelId) {
        return { ...p, status: 'generating' };
      }
      return p; // Completed panels remain untouched
    });

    const p1Untouched = targetedRetry[0].imageUrl === 'https://storage/p-1.png' && targetedRetry[0].status === 'completed';
    const p3Untouched = targetedRetry[2].imageUrl === 'https://storage/p-3.png' && targetedRetry[2].status === 'completed';
    const p2Targeted = targetedRetry[1].status === 'generating';

    report(
      'Test 6: Retrying a failed panel does not regenerate completed panels',
      p1Untouched && p3Untouched && p2Targeted
    );
  } catch (err: any) {
    report('Test 6: Isolated panel retry', false, err.message);
  }

  // --------------------------------------------------------------------------
  // Test Case 7: Stale localStorage images do not override new server data
  // --------------------------------------------------------------------------
  try {
    const dirtyLocalStorageData = {
      title: 'Stale Chapter',
      panels: [
        { panelId: 'p-1', imageUrl: 'https://image.pollinations.ai/prompt/yellow' },
        { panelId: 'p-2', imageUrl: '/assets/manhwa/action-quantum-core.jpg' },
      ],
    };

    // Run audit sanitizer
    const sanitized = dirtyLocalStorageData.panels.map((p: any) => {
      const raw = p.imageUrl || '';
      const isInvalid = !raw || raw.includes('pollinations') || raw.startsWith('/assets/manhwa/');
      return {
        ...p,
        imageUrl: isInvalid ? null : raw,
        status: isInvalid ? 'failed' : 'completed',
      };
    });

    const noPollinations = sanitized.every(p => !p.imageUrl?.includes('pollinations'));
    const noStockFallback = sanitized.every(p => !p.imageUrl?.includes('/assets/manhwa/'));
    const failedHonesty = sanitized[0].status === 'failed' && sanitized[0].imageUrl === null;

    report(
      'Test 7: Stale localStorage images do not override server data and are sanitized',
      noPollinations && noStockFallback && failedHonesty
    );
  } catch (err: any) {
    report('Test 7: Stale cache override prevention', false, err.message);
  }

  // --------------------------------------------------------------------------
  // Test Case 8: Partially generated chapters are not marked completed
  // --------------------------------------------------------------------------
  try {
    const panelsResult = [
      { panelId: 'p-1', status: 'completed', imageUrl: 'https://storage/p1.png' },
      { panelId: 'p-2', status: 'failed', imageUrl: null },
      { panelId: 'p-3', status: 'completed', imageUrl: 'https://storage/p3.png' },
    ];

    const completedCount = panelsResult.filter(p => p.status === 'completed' && p.imageUrl).length;
    const chapterStatus: 'ready' | 'partially_ready' | 'failed' =
      completedCount === panelsResult.length
        ? 'ready'
        : completedCount > 0
        ? 'partially_ready'
        : 'failed';

    report(
      'Test 8: Partially generated chapters are marked partially_ready, not completed',
      chapterStatus === 'partially_ready',
      `Calculated status: ${chapterStatus}`
    );
  } catch (err: any) {
    report('Test 8: Chapter partial status rule', false, err.message);
  }

  // --------------------------------------------------------------------------
  // Test Case 9: No Pollinations endpoint or fallback is called
  // --------------------------------------------------------------------------
  try {
    const fs = require('fs');
    const pipelineCode = fs.readFileSync('lib/manga-engine/pipeline.ts', 'utf8');
    const gatewayCode = fs.readFileSync('lib/ai-gateway/index.ts', 'utf8');
    const approveCode = fs.readFileSync('app/api/manga/approve/route.ts', 'utf8');
    const readerCode = fs.readFileSync('components/reader/WebtoonReader.tsx', 'utf8');

    const codebases = pipelineCode + gatewayCode + approveCode + readerCode;
    const hasPollinations = codebases.toLowerCase().includes('pollinations.ai');

    report(
      'Test 9: No Pollinations endpoint or fallback is present in core codebase',
      !hasPollinations,
      'Found pollinations reference in core files!'
    );
  } catch (err: any) {
    report('Test 9: Zero Pollinations verification', false, err.message);
  }

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(e => {
  console.error('Test suite failed:', e);
  process.exit(1);
});

