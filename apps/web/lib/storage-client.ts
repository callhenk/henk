import { createClient } from '@supabase/supabase-js';

export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

export class StorageClient {
  private supabase;

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  /**
   * Generate a unique filename for audio files
   */
  generateFileName(voiceId: string, timestamp?: number): string {
    const time = timestamp || Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    return `audio/${voiceId}_${time}_${randomId}.mp3`;
  }

  /**
   * Upload audio buffer to Supabase storage
   */
  async uploadAudio(
    audioBuffer: ArrayBuffer,
    fileName: string,
  ): Promise<UploadResult> {
    try {
      // Convert ArrayBuffer to Blob
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });

      // Upload to Supabase storage
      const { data, error } = await this.supabase.storage
        .from('audio')
        .upload(fileName, blob, {
          contentType: 'audio/mpeg',
          cacheControl: '3600',
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('audio')
        .getPublicUrl(fileName);

      return {
        url: urlData.publicUrl,
        path: fileName,
        size: audioBuffer.byteLength,
      };
    } catch (error) {
      throw new Error(
        `Storage upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete audio file from storage
   */
  async deleteAudio(filePath: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from('audio')
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      throw new Error(
        `Storage delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get signed URL for private files
   */
  async getSignedUrl(
    filePath: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase.storage
        .from('audio')
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw new Error(`Signed URL failed: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      throw new Error(
        `Signed URL failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
