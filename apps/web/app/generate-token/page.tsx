'use client';

import { useState } from 'react';

import { Copy, Key, Link } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';

export default function GenerateTokenPage() {
  const [email, setEmail] = useState('cyrus@callhenk.com');
  const [password, setPassword] = useState('test');
  const [token, setToken] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateToken = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-demo-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        setDemoUrl(data.url);
        toast.success('Demo token generated successfully!');
      } else {
        toast.error(data.error || 'Failed to generate token');
      }
    } catch {
      toast.error('Failed to generate token');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Demo Token Generator
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate secure demo tokens for client presentations
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-500" />
                Generate Token
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email for demo access"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password for demo access"
                />
              </div>

              <Button
                onClick={generateToken}
                disabled={isGenerating || !email || !password}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Generate Demo Token
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5 text-green-500" />
                Generated Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {token && (
                <>
                  <div className="space-y-2">
                    <Label>Demo Token</Label>
                    <div className="flex gap-2">
                      <Input
                        value={token}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(token, 'Token')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Demo URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={demoUrl}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(demoUrl, 'URL')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg border p-4">
                    <p className="mb-2 font-medium">Usage Instructions:</p>
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      <li>• Share the demo URL with clients</li>
                      <li>• Token provides secure access without login</li>
                      <li>• Clients can test phone calls and voice chat</li>
                      <li>• Token contains encrypted credentials</li>
                    </ul>
                  </div>
                </>
              )}

              {!token && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Key className="text-muted-foreground/50 mx-auto h-12 w-12" />
                  <p className="text-muted-foreground mt-2 text-sm">
                    Generate a token to see results
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 rounded-lg border bg-blue-50 p-4 dark:bg-blue-950/20">
          <h3 className="mb-2 font-medium text-blue-900 dark:text-blue-100">
            Security Note
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Demo tokens are encrypted and contain the specified credentials.
            They provide secure access to the demo page without requiring user
            registration. Each token is unique and can be regenerated as needed.
          </p>
        </div>
      </div>
    </div>
  );
}
