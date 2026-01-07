import { Router, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { VisionService } from '../services/vision.service';
import {
  CaptionResponse,
  SUPPORTED_IMAGE_TYPES,
  SupportedImageType,
  ValidationResult,
} from '../types';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to validate image types
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
): void => {
  if (SUPPORTED_IMAGE_TYPES.includes(file.mimetype as SupportedImageType)) {
    callback(null, true);
  } else {
    callback(
      new Error(
        `Invalid file type. Supported types: ${SUPPORTED_IMAGE_TYPES.join(', ')}`
      )
    );
  }
};

// Configure multer with size limit (10MB)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Initialize Vision Service
const getVisionService = (): VisionService => {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const modelId = process.env.AZURE_OPENAI_MODEL_ID;

  if (!apiKey || !endpoint || !modelId) {
    throw new Error('Missing required Azure OpenAI environment variables');
  }

  return new VisionService({
    apiKey,
    endpoint,
    modelId,
  });
};

/**
 * Validate uploaded file
 */
const validateFile = (file: Express.Multer.File | undefined): ValidationResult => {
  if (!file) {
    return { isValid: false, error: 'No image file provided' };
  }

  if (!file.buffer || file.buffer.length === 0) {
    return { isValid: false, error: 'Empty file uploaded' };
  }

  if (!SUPPORTED_IMAGE_TYPES.includes(file.mimetype as SupportedImageType)) {
    return {
      isValid: false,
      error: `Invalid file type: ${file.mimetype}. Supported: ${SUPPORTED_IMAGE_TYPES.join(', ')}`,
    };
  }

  return { isValid: true };
};

/**
 * POST /api/caption
 * Upload an image and generate a caption
 */
router.post(
  '/',
  upload.single('image'),
  async (req: Request, res: Response): Promise<void> => {
    const response: CaptionResponse = {
      success: false,
      timestamp: new Date().toISOString(),
    };

    try {
      // Validate file
      const validation = validateFile(req.file);
      if (!validation.isValid) {
        response.error = validation.error;
        res.status(400).json(response);
        return;
      }

      const file = req.file!;

      // Initialize vision service and generate caption
      const visionService = getVisionService();
      const caption = await visionService.generateCaption(
        file.buffer,
        file.mimetype
      );

      response.success = true;
      response.caption = caption;
      res.status(200).json(response);
    } catch (error) {
      console.error('Caption generation error:', error);
      response.error =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json(response);
    }
  }
);

/**
 * POST /api/caption/custom
 * Upload an image and generate a caption with custom prompt
 */
router.post(
  '/custom',
  upload.single('image'),
  async (req: Request, res: Response): Promise<void> => {
    const response: CaptionResponse = {
      success: false,
      timestamp: new Date().toISOString(),
    };

    try {
      // Validate file
      const validation = validateFile(req.file);
      if (!validation.isValid) {
        response.error = validation.error;
        res.status(400).json(response);
        return;
      }

      // Get custom prompt from request body
      const customPrompt = req.body.prompt as string;
      if (!customPrompt || customPrompt.trim().length === 0) {
        response.error = 'Custom prompt is required';
        res.status(400).json(response);
        return;
      }

      const file = req.file!;

      // Initialize vision service and generate caption
      const visionService = getVisionService();
      const caption = await visionService.generateCaptionWithPrompt(
        file.buffer,
        file.mimetype,
        customPrompt.trim()
      );

      response.success = true;
      response.caption = caption;
      res.status(200).json(response);
    } catch (error) {
      console.error('Caption generation error:', error);
      response.error =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json(response);
    }
  }
);

/**
 * GET /api/caption/health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supportedFormats: SUPPORTED_IMAGE_TYPES,
    maxFileSize: '10MB',
  });
});

// Error handling middleware for multer errors
router.use(
  (
    error: Error,
    _req: Request,
    res: Response,
    _next: Function
  ): void => {
    const response: CaptionResponse = {
      success: false,
      timestamp: new Date().toISOString(),
    };

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        response.error = 'File size exceeds the 10MB limit';
        res.status(400).json(response);
        return;
      }
      response.error = `Upload error: ${error.message}`;
      res.status(400).json(response);
      return;
    }

    response.error = error.message || 'An unexpected error occurred';
    res.status(500).json(response);
  }
);

export default router;
