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
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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

    try {
      const result = await generativeModel.generateContent(userPrompt);
      return result.response.text();
    } catch (e: any) {
      if (e.message && e.message.includes('429')) {
        console.warn('Gemini 429 rate limit encountered. Retrying in 3 seconds...');
        await new Promise(r => setTimeout(r, 3000));
        const retryResult = await generativeModel.generateContent(userPrompt);
        return retryResult.response.text();
      }
      throw e;
    }
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

export interface GeminiImageResult {
  success: boolean;
  modelUsed: string;
  imageBase64?: string;
  mimeType?: string;
  errorCode?: 'IMAGE_QUOTA_EXCEEDED' | 'BILLING_REQUIRED' | 'INVALID_API_KEY' | 'SAFETY_BLOCKED' | 'MODEL_UNAVAILABLE' | 'GENERATION_FAILED';
  errorMessage?: string;
  statusCode?: number;
}

/**
 * Generate image using Gemini Image Diffusion models (gemini-2.5-flash-image / gemini-3.1-flash-image).
 * Returns strict structured result with honest error codes if quota or billing blocks generation.
 */
export async function generateImageWithGemini(opts: {
  apiKey: string;
  prompt: string;
  aspectRatio?: '9:16' | '1:1' | '16:9' | '3:4';
  referenceImages?: { base64: string; mimeType: string; description?: string }[];
}): Promise<GeminiImageResult> {
  const { apiKey, prompt, referenceImages = [] } = opts;
  const imageModels = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image'];

  if (!apiKey) {
    return {
      success: false,
      modelUsed: 'none',
      errorCode: 'INVALID_API_KEY',
      errorMessage: 'No Gemini API key was provided.',
      statusCode: 401,
    };
  }

  let lastError: GeminiImageResult = {
    success: false,
    modelUsed: imageModels[0],
    errorCode: 'GENERATION_FAILED',
    errorMessage: 'Image generation call failed.',
    statusCode: 500,
  };

  for (const model of imageModels) {
    try {
      // Build multimodal parts: visual conditioning references first, then prompt text
      const parts: any[] = [];

      for (const ref of referenceImages) {
        if (ref.base64) {
          parts.push({
            inlineData: {
              mimeType: ref.mimeType || 'image/jpeg',
              data: ref.base64,
            },
          });
          if (ref.description) {
            parts.push({
              text: `[Character Conditioning Reference: ${ref.description}]`,
            });
          }
        }
      }

      parts.push({ text: prompt });

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseModalities: ['TEXT', 'IMAGE'],
            },
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = data?.error?.message || res.statusText || 'Unknown Gemini API error';
        const isQuotaZero =
          res.status === 429 ||
          errorMsg.includes('limit: 0') ||
          errorMsg.includes('Free Tier') ||
          errorMsg.includes('quota');

        lastError = {
          success: false,
          modelUsed: model,
          statusCode: res.status,
          errorCode: isQuotaZero ? 'IMAGE_QUOTA_EXCEEDED' : res.status === 400 || res.status === 403 ? 'INVALID_API_KEY' : 'GENERATION_FAILED',
          errorMessage: isQuotaZero
            ? 'Google AI Studio Free Tier enforces a quota limit of 0 requests/day for image diffusion models. Google Cloud Billing (Pay-As-You-Go) must be linked to your Google AI Studio project to generate original panel artwork.'
            : errorMsg,
        };
        continue;
      }

      const candidate = data.candidates?.[0];
      const resParts = candidate?.content?.parts || [];

      for (const part of resParts) {
        if (part.inlineData && part.inlineData.data) {
          return {
            success: true,
            modelUsed: model,
            statusCode: 200,
            imageBase64: part.inlineData.data,
            mimeType: part.inlineData.mimeType || 'image/png',
          };
        }
      }

      lastError = {
        success: false,
        modelUsed: model,
        statusCode: 200,
        errorCode: 'GENERATION_FAILED',
        errorMessage: 'Model returned response without image data part.',
      };
    } catch (err: any) {
      lastError = {
        success: false,
        modelUsed: model,
        statusCode: 500,
        errorCode: 'GENERATION_FAILED',
        errorMessage: err.message || 'Network exception during Gemini image call.',
      };
    }
  }

  return lastError;
}
