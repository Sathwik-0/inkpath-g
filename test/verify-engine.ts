/**
 * INKPATH ENGINE - AUTOMATED ACCEPTANCE TEST SUITE
 * Run with: npx tsx --env-file=.env test/verify-engine.ts
 */

import fs from 'fs';
import path from 'path';

// Load .env manually if not preloaded
if (!process.env.KEY_ENCRYPTION_SECRET) {
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
}

import { encryptApiKey, decryptApiKey, maskApiKey } from '../lib/crypto/enclave';
import { IngestionSourceSchema, DecoupledBalloonSchema, CreateMangaRequestSchema } from '../lib/validations/manga';
import { AI_MODELS_CONFIG } from '../lib/ai-gateway/config';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING INKPATH ENGINE ACCEPTANCE TESTS');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean) {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
      failed++;
    }
  }

  // 1. Crypto Enclave AES-256-GCM Round Trip
  try {
    const rawKey = 'AIzaSyDemoSecretKeyForTesting1234567890';
    const encrypted = encryptApiKey(rawKey);
    assert('AES-256-GCM: Ciphertext generated', !!encrypted.ciphertext && encrypted.ciphertext.length > 0);
    assert('AES-256-GCM: IV is 24 hex chars (12 bytes)', encrypted.iv.length === 24);
    assert('AES-256-GCM: Auth tag is 32 hex chars (16 bytes)', encrypted.authTag.length === 32);

    const decrypted = decryptApiKey(encrypted.ciphertext, encrypted.iv, encrypted.authTag);
    assert('AES-256-GCM: Decryption round-trip exact match', decrypted === rawKey);

    const masked = maskApiKey(rawKey);
    assert('Key Masking: Correctly masks key (AIza...7890)', masked === 'AIza...7890');
  } catch (err: any) {
    assert(`AES-256-GCM Enclave test failed: ${err.message}`, false);
  }

  // 2. Zod Validation Schemas
  try {
    const validSource = {
      type: 'pdf',
      title: 'Quantum Wavepackets',
      rawContent: 'State vector psi resides as coherent superposition of eigenstates.',
    };
    const parsedSource = IngestionSourceSchema.safeParse(validSource);
    assert('Zod: IngestionSourceSchema parses valid PDF source', parsedSource.success);

    const invalidSource = {
      type: 'invalid_type',
      title: 'X', // too short
    };
    const parsedInvalid = IngestionSourceSchema.safeParse(invalidSource);
    assert('Zod: IngestionSourceSchema rejects invalid modality and short title', !parsedInvalid.success);

    const validBalloon = {
      id: '00000000-0000-0000-0000-000000000001',
      speakerName: 'Jin Woo-Hyun',
      type: 'speech',
      text: 'Wavepacket decoherence detected!',
      xPercent: 45.5,
      yPercent: 30.0,
      maxWidthPercent: 50,
      rotationDeg: 0,
      tailDirection: 'bottom-left',
    };
    const parsedBalloon = DecoupledBalloonSchema.safeParse(validBalloon);
    assert('Zod: DecoupledBalloonSchema parses valid spatial balloon', parsedBalloon.success);
  } catch (err: any) {
    assert(`Zod test failed: ${err.message}`, false);
  }

  // 3. AI Providers Configuration Integrity
  try {
    assert('Config: Gemini provider declared', !!AI_MODELS_CONFIG.gemini);
    assert('Config: Gemini is configured for image support', AI_MODELS_CONFIG.gemini.supportsImage === true);
    assert('Config: OpenAI is text only', AI_MODELS_CONFIG.openai.supportsImage === false);
    assert('Config: Claude is text only', AI_MODELS_CONFIG.claude.supportsImage === false);
  } catch (err: any) {
    assert(`Provider config test failed: ${err.message}`, false);
  }

  console.log('====================================================');
  console.log(`📊 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
