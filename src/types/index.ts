/**
 * Type definitions for the AI Image Caption Generator
 */

/**
 * Response structure for caption generation
 */
export interface CaptionResponse {
  success: boolean;
  caption?: string;
  error?: string;
  timestamp: string;
}

/**
 * Configuration for Azure OpenAI Vision service
 */
export interface AzureOpenAIConfig {
  apiKey: string;
  endpoint: string;
  modelId: string;
}

/**
 * Supported image MIME types
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export type SupportedImageType = (typeof SUPPORTED_IMAGE_TYPES)[number];

/**
 * Image upload validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Vision API message content types
 */
export interface ImageUrlContent {
  type: 'image_url';
  image_url: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

export interface TextContent {
  type: 'text';
  text: string;
}

export type MessageContent = ImageUrlContent | TextContent;
