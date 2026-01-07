import { AzureOpenAI } from 'openai';
import { AzureOpenAIConfig, MessageContent } from '../types';

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Vision Service for generating image captions using Azure OpenAI Vision
 */
export class VisionService {
  private client: AzureOpenAI;
  private modelId: string;
  private maxRetries: number = 3;
  private baseDelay: number = 1000; // 1 second

  constructor(config: AzureOpenAIConfig) {
    this.client = new AzureOpenAI({
      apiKey: config.apiKey,
      endpoint: config.endpoint,
      apiVersion: '2024-02-15-preview',
    });
    this.modelId = config.modelId;
  }

  /**
   * Execute with retry logic and exponential backoff
   */
  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if it's a rate limit error (429)
        const isRateLimit = lastError.message.includes('429') || 
                           lastError.message.toLowerCase().includes('rate limit');
        
        if (isRateLimit && attempt < this.maxRetries - 1) {
          const delay = this.baseDelay * Math.pow(2, attempt); // Exponential backoff
          console.log(`Rate limited. Retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`);
          await sleep(delay);
          continue;
        }
        
        throw lastError;
      }
    }
    
    throw lastError;
  }

  /**
   * Generate a caption for an image
   * @param imageBuffer - The image file buffer
   * @param mimeType - The MIME type of the image
   * @returns Generated caption string
   */
  async generateCaption(imageBuffer: Buffer, mimeType: string): Promise<string> {
    return this.withRetry(async () => {
      // Convert image buffer to base64
      const base64Image = imageBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      // Prepare the message content
      const messageContent: MessageContent[] = [
        {
          type: 'text',
          text: 'Please analyze this image and generate a detailed, natural language caption that describes what you see. Include relevant details about the subjects, actions, setting, colors, and mood if applicable. Keep the caption concise but informative (1-3 sentences).',
        },
        {
          type: 'image_url',
          image_url: {
            url: dataUrl,
            detail: 'auto',
          },
        },
      ];

      // Call Azure OpenAI Vision API
      const response = await this.client.chat.completions.create({
        model: this.modelId,
        messages: [
          {
            role: 'user',
            content: messageContent as any,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      // Extract the caption from the response
      const caption = response.choices[0]?.message?.content;

      if (!caption) {
        throw new Error('No caption generated from the AI model');
      }

      return caption.trim();
    }).catch((error) => {
      console.error('Vision service error:', error);
      
      if (error instanceof Error) {
        // Handle specific API errors
        if (error.message.includes('401')) {
          throw new Error('Invalid API key or unauthorized access');
        }
        if (error.message.includes('404')) {
          throw new Error('Model deployment not found');
        }
        if (error.message.includes('429')) {
          throw new Error('API ถูกจำกัด กรุณารอสักครู่');
        }
        throw new Error(`Failed to generate caption: ${error.message}`);
      }
      
      throw new Error('An unexpected error occurred while generating the caption');
    });
  }

  /**
   * Generate a caption with custom prompt
   * @param imageBuffer - The image file buffer
   * @param mimeType - The MIME type of the image
   * @param customPrompt - Custom prompt for caption generation
   * @returns Generated caption string
   */
  async generateCaptionWithPrompt(
    imageBuffer: Buffer,
    mimeType: string,
    customPrompt: string
  ): Promise<string> {
    return this.withRetry(async () => {
      const base64Image = imageBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      const messageContent: MessageContent[] = [
        {
          type: 'text',
          text: customPrompt,
        },
        {
          type: 'image_url',
          image_url: {
            url: dataUrl,
            detail: 'auto',
          },
        },
      ];

      const response = await this.client.chat.completions.create({
        model: this.modelId,
        messages: [
          {
            role: 'user',
            content: messageContent as any,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const caption = response.choices[0]?.message?.content;

      if (!caption) {
        throw new Error('No response generated from the AI model');
      }

      return caption.trim();
    }).catch((error) => {
      console.error('Vision service error:', error);
      if (error instanceof Error && error.message.includes('429')) {
        throw new Error('API ถูกจำกัด กรุณารอสักครู่');
      }
      throw error instanceof Error
        ? error
        : new Error('An unexpected error occurred');
    });
  }
}
