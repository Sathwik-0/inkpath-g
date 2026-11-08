import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_MODELS_CONFIG, SupportedProvider } from './config';

export interface GenerateTextOptions {
  provider: SupportedProvider;
  apiKey: string;
  model?: string;
  systemPrompt?: string;
  userPrompt: string;
  responseJsonSchema?: boolean;
}

export interface GenerateImageOptions {
  apiKey: string;
  prompt: string;
  aspectRatio?: '9:16' | '1:1' | '16:9' | '3:4';
  negativePrompt?: string;
  referenceImageBase64?: string;
}

/**
 * Validates a provider API key with a cheap, bounded test ping.
 */
export async function validateProviderKey(
  provider: SupportedProvider,
  apiKey: string
): Promise<{ valid: boolean; message?: string }> {
  try {
    if (provider === 'gemini') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
        generationConfig: { maxOutputTokens: 2 },
      });
      const text = result.response.text();
      return { valid: !!text };
    }

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.ok) return { valid: true };
      const err = await res.json().catch(() => ({}));
      return { valid: false, message: err.error?.message || 'Invalid OpenAI Key' };
    }

    if (provider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 2,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      });
      if (res.ok || res.status === 400) return { valid: true };
      return { valid: false, message: 'Invalid Anthropic API Key' };
    }

    return { valid: false, message: 'Unsupported provider' };
  } catch (error: any) {
    return { valid: false, message: error.message || 'Key validation network failure' };
  }
}

/**
 * Unified text generation across Gemini, OpenAI, Claude.
 */
export async function generateTextWithProvider(opts: GenerateTextOptions): Promise<string> {
  const { provider, apiKey, model, systemPrompt, userPrompt, responseJsonSchema } = opts;

  if (provider === 'gemini') {
    const genAI = new GoogleGenerativeAI(apiKey);
    const targetModel = model || AI_MODELS_CONFIG.gemini.defaultTextModel;
    const generativeModel = genAI.getGenerativeModel({
      model: targetModel,
      systemInstruction: systemPrompt,
      generationConfig: responseJsonSchema
        ? { responseMimeType: 'application/json' }
        : undefined,
    });

    const result = await generativeModel.generateContent(userPrompt);
    return result.response.text();
  }

  if (provider === 'openai') {
    const targetModel = model || AI_MODELS_CONFIG.openai.defaultTextModel;
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userPrompt });

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: targetModel,
        messages,
        response_format: responseJsonSchema ? { type: 'json_object' } : undefined,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenAI request failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.choices[0]?.message?.content || '';
  }

  if (provider === 'claude') {
    const targetModel = model || AI_MODELS_CONFIG.claude.defaultTextModel;
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: targetModel,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Claude request failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.content[0]?.text || '';
  }

  throw new Error(`Unsupported provider: ${provider}`);
}
