# AI Image Caption Generator

🖼️ A TypeScript-based web application that generates natural language captions for images using Azure OpenAI Vision.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Azure](https://img.shields.io/badge/Azure_OpenAI-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)

## 📋 Overview

This project provides a clean, well-structured API and web interface for generating AI-powered image captions. Users can upload an image, and the application sends it to Azure OpenAI's Vision model to generate a descriptive, natural language caption.

## ✨ Features

- **Image Upload**: Support for JPEG, PNG, GIF, and WebP formats (up to 10MB)
- **AI-Powered Captions**: Generates detailed, natural language descriptions using Azure OpenAI Vision
- **Custom Prompts**: Option to provide custom prompts for specialized caption generation
- **RESTful API**: Clean API endpoints for easy integration
- **Web Interface**: Simple, responsive drag-and-drop frontend
- **Error Handling**: Comprehensive validation and error responses
- **TypeScript**: Fully typed codebase for better developer experience

## 🏗️ Project Structure

```
ai-image-caption-generator-ts/
├── src/
│   ├── server.ts              # Express server setup
│   ├── routes/
│   │   └── caption.route.ts   # Caption API routes
│   ├── services/
│   │   └── vision.service.ts  # Azure OpenAI Vision integration
│   └── types/
│       └── index.ts           # TypeScript type definitions
├── public/
│   └── index.html             # Frontend web interface
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── package.json               # Project dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Azure OpenAI resource with a Vision-capable model deployment
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-image-caption-generator-ts.git
   cd ai-image-caption-generator-ts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Azure OpenAI credentials:
   ```env
   PORT=3000
   AZURE_OPENAI_API_KEY=your_api_key_here
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_OPENAI_MODEL_ID=your_deployment_name
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   npm start
   ```

   Or for development with hot reload:
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to `http://localhost:3000` in your browser.

## 🔌 API Reference

### Generate Caption

**POST** `/api/caption`

Upload an image and receive an AI-generated caption.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` (file) - The image file to analyze

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/caption \
  -F "image=@/path/to/your/image.jpg"
```

**Success Response (200):**
```json
{
  "success": true,
  "caption": "A golden retriever puppy playing in a sunny park, surrounded by green grass and colorful autumn leaves.",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "No image file provided",
  "timestamp": "2026-01-07T10:30:00.000Z"
}
```

### Generate Caption with Custom Prompt

**POST** `/api/caption/custom`

Upload an image with a custom prompt for specialized analysis.

**Request:**
- Content-Type: `multipart/form-data`
- Body: 
  - `image` (file) - The image file
  - `prompt` (string) - Custom analysis prompt

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/caption/custom \
  -F "image=@/path/to/your/image.jpg" \
  -F "prompt=Describe the emotions and mood conveyed in this image"
```

### Health Check

**GET** `/api/caption/health`

Check API status and supported formats.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-07T10:30:00.000Z",
  "supportedFormats": ["image/jpeg", "image/png", "image/gif", "image/webp"],
  "maxFileSize": "10MB"
}
```

## 🛠️ Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3000) | No |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | Yes |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint URL | Yes |
| `AZURE_OPENAI_MODEL_ID` | Deployment name of your Vision model | Yes |

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run clean` | Remove dist folder |

## 🧪 Testing the API

### Using the Web Interface

1. Open `http://localhost:3000` in your browser
2. Drag and drop an image or click to browse
3. Click "Generate Caption"
4. View and copy the generated caption

### Using Postman

1. Create a new POST request to `http://localhost:3000/api/caption`
2. In the Body tab, select `form-data`
3. Add a key `image` with type `File`
4. Select your image file
5. Send the request

### Using JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/caption', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.caption);
```

## 🔒 Security Notes

- Never commit `.env` files with real credentials
- The `.gitignore` file excludes sensitive files
- Consider adding rate limiting for production use
- Validate and sanitize all user inputs

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ using TypeScript, Express, and Azure OpenAI Vision
