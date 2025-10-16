const DEMO_SECRET =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-secret-key-henk-2024';

// Simple XOR-based encryption for demo purposes (browser compatible)
function simpleEncrypt(text: string, key: string): string {
  const textBytes = Buffer.from(text, 'utf8');
  const keyBytes = Buffer.from(key, 'utf8');
  const result = Buffer.alloc(textBytes.length);

  for (let i = 0; i < textBytes.length; i++) {
    result[i] = textBytes[i]! ^ keyBytes[i % keyBytes.length]!;
  }

  return result.toString('hex');
}

function simpleDecrypt(encrypted: string, key: string): string {
  const encryptedBytes = Buffer.from(encrypted, 'hex');
  const keyBytes = Buffer.from(key, 'utf8');
  const result = Buffer.alloc(encryptedBytes.length);

  for (let i = 0; i < encryptedBytes.length; i++) {
    result[i] = encryptedBytes[i]! ^ keyBytes[i % keyBytes.length]!;
  }

  return result.toString('utf8');
}

export interface DemoTokenData {
  email: string;
  password: string;
  allowedAgentIds?: string[];
  demoName?: string;
}

export function createDemoToken(data: DemoTokenData): string {
  const payload = JSON.stringify(data);
  const encrypted = simpleEncrypt(payload, DEMO_SECRET);
  // Add a timestamp and some randomness to make tokens unique
  const timestamp = Date.now().toString();
  const combined = `${timestamp}:${encrypted}`;
  return Buffer.from(combined).toString('base64');
}

export function verifyDemoToken(token: string): DemoTokenData | null {
  try {
    const combined = Buffer.from(token, 'base64').toString('utf8');
    const [timestampStr, encrypted] = combined.split(':');

    if (!timestampStr || !encrypted) {
      return null;
    }

    const decrypted = simpleDecrypt(encrypted, DEMO_SECRET);
    const data = JSON.parse(decrypted) as DemoTokenData;

    return data;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function isValidDemoToken(token: string): boolean {
  return verifyDemoToken(token) !== null;
}
