export interface FalAiImageProcessRequest {
  image_url: string;
  prompt: string;
  quality?: 'standard' | 'high' | 'ultra';
  format?: 'png' | 'jpg' | 'webp';
  speed?: number;
}

export interface FalAiImageProcessResponse {
  image: {
    url: string;
    width: number;
    height: number;
  };
  seed: number;
  has_nsfw_concepts: boolean;
}

export class FalAiClient {
  private apiKey: string;
  private baseUrl = 'https://fal.run';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async processImageWithNanoBanana(request: FalAiImageProcessRequest): Promise<FalAiImageProcessResponse> {
    const response = await fetch(`${this.baseUrl}/fal-ai/nano-banana/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${this.apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`fal.ai API error: ${response.status} - ${error.error || response.statusText}`);
    }

    return response.json();
  }

  async getUploadUrl(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/storage/upload/initiate`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get upload URL: ${response.statusText}`);
    }

    const data = await response.json();
    return data.upload_url;
  }

  async uploadImage(file: File): Promise<string> {
    const uploadUrl = await this.getUploadUrl();
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
    }

    // Return the file URL
    const url = new URL(uploadUrl);
    return `https://fal.media${url.pathname}`;
  }
}

// Create a singleton instance for use throughout the app
const apiKey = process.env.FAL_API_KEY || import.meta.env.VITE_FAL_API_KEY;
if (!apiKey) {
  console.warn('FAL_API_KEY not found. Image processing will not work.');
}

export const falAiClient = apiKey ? new FalAiClient(apiKey) : null;
