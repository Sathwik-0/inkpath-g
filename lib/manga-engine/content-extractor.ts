import { YoutubeTranscript } from 'youtube-transcript';
// pdf-parse is required conditionally in Node runtime
let pdfParse: any = null;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  // pdf-parse loaded lazily
}

export interface ExtractedContentResult {
  text: string;
  title?: string;
  sourceType: string;
  metadata: Record<string, any>;
}

/**
 * Extracts raw textual knowledge from diverse student inputs:
 * 1. PDF curriculum documents
 * 2. YouTube lecture links (transcript extraction)
 * 3. Raw syllabus notes / markdown
 * 4. Academic curriculum topics
 */
export async function extractContent(source: {
  type: string;
  rawContent?: string;
  fileBase64?: string;
  url?: string;
}): Promise<ExtractedContentResult> {
  const { type, rawContent, fileBase64, url } = source;

  // 1. YouTube Lecture Extraction
  if (type === 'youtube' && url) {
    try {
      // Extract video ID from youtube.com/watch?v=... or youtu.be/...
      const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
      const videoId = videoIdMatch ? videoIdMatch[1] : url;

      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      const fullTranscript = transcript.map(item => item.text).join(' ');
      
      const cleanText = fullTranscript.slice(0, 15000);
      return {
        text: cleanText || 'YouTube lecture transcript unavailable.',
        title: `YouTube Lecture (${videoId})`,
        sourceType: 'youtube',
        metadata: { videoId, segmentCount: transcript.length },
      };
    } catch (err: any) {
      console.warn('YouTube transcript extraction error:', err.message);
      return {
        text: `Lecture Topic Reference: ${url}. Pedagogical analysis requested on standard curriculum topics covered in this lecture.`,
        title: 'Video Lecture',
        sourceType: 'youtube',
        metadata: { error: err.message },
      };
    }
  }

  // 2. PDF Document Extraction
  if (type === 'pdf' && fileBase64) {
    try {
      const buffer = Buffer.from(fileBase64, 'base64');
      const parser = pdfParse || require('pdf-parse');
      const pdfData = await parser(buffer);
      const text = (pdfData.text || '').replace(/\s+/g, ' ').trim().slice(0, 15000);
      return {
        text: text || 'PDF document contained no extractable text.',
        title: 'Uploaded Textbook / Syllabus',
        sourceType: 'pdf',
        metadata: { pages: pdfData.numpages, info: pdfData.info },
      };
    } catch (err: any) {
      console.warn('PDF parsing error:', err.message);
      return {
        text: rawContent || 'Uploaded document content could not be parsed as text.',
        title: 'PDF Document',
        sourceType: 'pdf',
        metadata: { error: err.message },
      };
    }
  }

  // 3. Topic mode
  if (type === 'topic') {
    const topic = rawContent || 'Modern Computer Science';
    return {
      text: `Curriculum Topic: ${topic}. Provide an rigorous, comprehensive academic breakdown of this subject including core laws, equations, theorems, and practical applications.`,
      title: topic,
      sourceType: 'topic',
      metadata: { topic },
    };
  }

  // 4. Raw text / Syllabus paste
  const clean = (rawContent || '').slice(0, 15000);
  return {
    text: clean,
    title: 'Custom Syllabus Notes',
    sourceType: 'text',
    metadata: { charLength: clean.length },
  };
}

