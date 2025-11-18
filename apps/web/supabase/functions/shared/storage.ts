// Supabase Storage Client for Audio Files
// Handles uploading and managing audio files in Supabase Storage

export interface StorageUploadResponse {
  url: string;
  path: string;
  size: number;
}

export class StorageClient {
  private supabaseUrl: string;
  private supabaseServiceKey: string;
  private isDemoMode: boolean;

  constructor(supabaseUrl?: string, supabaseServiceKey?: string) {
    this.supabaseUrl = supabaseUrl || Deno.env.get('SUPABASE_URL') || '';
    this.supabaseServiceKey =
      supabaseServiceKey || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    // Demo mode if no service key, or if we're in local development (kong:8000)
    this.isDemoMode =
      !this.supabaseServiceKey || this.supabaseUrl.includes('kong:8000');

    if (this.isDemoMode) {
      console.warn(
        'Storage client initialized in demo mode - no actual storage operations will be performed',
      );
    }
  }

  /**
   * Upload audio buffer to Supabase Storage
   */
  async uploadAudio(
    audioBuffer: ArrayBuffer,
    fileName: string,
  ): Promise<StorageUploadResponse> {
    try {
      // If in demo mode, return mock response
      if (this.isDemoMode) {
        return {
          url: `https://demo-storage.supabase.co/storage/v1/object/public/audio/${fileName}`,
          path: `audio/${fileName}`,
          size: audioBuffer.byteLength,
        };
      }

      // Convert ArrayBuffer to Uint8Array for upload
      const audioData = new Uint8Array(audioBuffer);

      // Create form data for upload
      const formData = new FormData();
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      formData.append('file', blob, fileName);

      const response = await fetch(
        `${this.supabaseUrl}/storage/v1/object/audio/${fileName}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.supabaseServiceKey}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to upload audio: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      await response.json();

      return {
        url: `${this.supabaseUrl}/storage/v1/object/public/audio/${fileName}`,
        path: `audio/${fileName}`,
        size: audioBuffer.byteLength,
      };
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw error;
    }
  }

  /**
   * Delete audio file from storage
   */
  async deleteAudio(filePath: string): Promise<void> {
    try {
      if (this.isDemoMode) {
        console.log('Demo mode: Skipping audio deletion');
        return;
      }

      const response = await fetch(
        `${this.supabaseUrl}/storage/v1/object/audio/${filePath}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.supabaseServiceKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete audio: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error('Error deleting audio:', error);
      throw error;
    }
  }

  /**
   * Get public URL for audio file
   */
  getPublicUrl(filePath: string): string {
    if (this.isDemoMode) {
      return `https://demo-storage.supabase.co/storage/v1/object/public/audio/${filePath}`;
    }
    return `${this.supabaseUrl}/storage/v1/object/public/audio/${filePath}`;
  }

  /**
   * Generate unique filename for audio
   */
  generateFileName(voiceId: string, timestamp?: number): string {
    const ts = timestamp || Date.now();
    return `generated/${ts}_${voiceId}.mp3`;
  }
}
