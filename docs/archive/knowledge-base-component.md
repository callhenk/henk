# Knowledge Base Management Component

## 🎯 Overview

This component allows users to create and manage ElevenLabs Knowledge Bases from text, URLs, and other sources based on the [ElevenLabs Knowledge Base API](https://elevenlabs.io/docs/api-reference/knowledge-base/create-from-text).

## 🚀 React Component

```javascript
// components/KnowledgeBaseManager.js
import React, { useEffect, useState } from 'react';

const EDGE_FUNCTIONS_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1';

export default function KnowledgeBaseManager() {
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [formData, setFormData] = useState({
    name: '',
    text: '',
    url: '',
    description: '',
    file: null,
  });
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState(null);
  const [additionalText, setAdditionalText] = useState('');

  // Load knowledge bases on component mount
  useEffect(() => {
    loadKnowledgeBases();
  }, []);

  const loadKnowledgeBases = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-knowledge-base`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        },
      );

      const result = await response.json();
      if (result.success) {
        setKnowledgeBases(result.data.knowledge_bases || []);
      }
    } catch (error) {
      console.error('Error loading knowledge bases:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFromText = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-knowledge-base/text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            name: formData.name,
            text: formData.text,
            description: formData.description,
          }),
        },
      );

      const result = await response.json();
      if (result.success) {
        alert('Knowledge base created successfully!');
        setFormData({
          name: '',
          text: '',
          url: '',
          description: '',
          file: null,
        });
        loadKnowledgeBases();
      } else {
        alert('Error creating knowledge base: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating knowledge base:', error);
      alert('Error creating knowledge base');
    } finally {
      setLoading(false);
    }
  };

  const createFromUrl = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-knowledge-base/url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            url: formData.url,
            name: formData.name,
          }),
        },
      );

      const result = await response.json();
      if (result.success) {
        alert('Knowledge base created from URL!');
        setFormData({
          name: '',
          text: '',
          url: '',
          description: '',
          file: null,
        });
        loadKnowledgeBases();
      } else {
        alert('Error creating knowledge base: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating knowledge base from URL:', error);
      alert('Error creating knowledge base from URL');
    } finally {
      setLoading(false);
    }
  };

  const addTextToKnowledgeBase = async (knowledgeBaseId, text) => {
    setLoading(true);

    try {
      const response = await fetch(
        `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-knowledge-base/${knowledgeBaseId}/text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ text }),
        },
      );

      const result = await response.json();
      if (result.success) {
        alert('Text added to knowledge base successfully!');
        setAdditionalText('');
        loadKnowledgeBases();
      } else {
        alert('Error adding text: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding text to knowledge base:', error);
      alert('Error adding text to knowledge base');
    } finally {
      setLoading(false);
    }
  };

  const deleteKnowledgeBase = async (knowledgeBaseId) => {
    if (!confirm('Are you sure you want to delete this knowledge base?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-knowledge-base/${knowledgeBaseId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        },
      );

      const result = await response.json();
      if (result.success) {
        alert('Knowledge base deleted successfully!');
        loadKnowledgeBases();
      } else {
        alert('Error deleting knowledge base: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting knowledge base:', error);
      alert('Error deleting knowledge base');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, text: e.target.result });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-8 text-3xl font-bold">Knowledge Base Manager</h1>

      {/* Create Knowledge Base Section */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">
          Create New Knowledge Base
        </h2>

        {/* Tab Navigation */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setActiveTab('text')}
            className={`rounded-lg px-4 py-2 ${
              activeTab === 'text'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            From Text
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`rounded-lg px-4 py-2 ${
              activeTab === 'url'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            From URL
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`rounded-lg px-4 py-2 ${
              activeTab === 'file'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            From File
          </button>
        </div>

        {/* Create from Text */}
        {activeTab === 'text' && (
          <form onSubmit={createFromText} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Knowledge Base Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a name for your knowledge base"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the knowledge base"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Content</label>
              <textarea
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                className="h-48 w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your knowledge base content here..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-500 px-6 py-3 font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Knowledge Base'}
            </button>
          </form>
        )}

        {/* Create from URL */}
        {activeTab === 'url' && (
          <form onSubmit={createFromUrl} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Knowledge Base Name (Optional)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a name for your knowledge base"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/fundraising-faq"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-green-500 px-6 py-3 font-medium text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create from URL'}
            </button>
          </form>
        )}

        {/* Create from File */}
        {activeTab === 'file' && (
          <form onSubmit={createFromText} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Knowledge Base Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a name for your knowledge base"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the knowledge base"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Upload File
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                accept=".txt,.md,.doc,.docx"
              />
              <p className="mt-1 text-sm text-gray-500">
                Supported formats: .txt, .md, .doc, .docx
              </p>
            </div>

            {formData.text && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  File Content Preview
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  className="h-32 w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="File content will appear here..."
                  readOnly
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !formData.text}
              className="w-full rounded-lg bg-purple-500 px-6 py-3 font-medium text-white hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create from File'}
            </button>
          </form>
        )}
      </div>

      {/* Knowledge Bases List */}
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Your Knowledge Bases</h2>

        {loading ? (
          <div className="py-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading knowledge bases...</p>
          </div>
        ) : knowledgeBases.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-600">
              No knowledge bases found. Create your first one above!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {knowledgeBases.map((kb) => (
              <div
                key={kb.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{kb.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {kb.description}
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>ID: {kb.id}</span>
                      <span>Status: {kb.status}</span>
                      {kb.content_count && (
                        <span>Items: {kb.content_count}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedKnowledgeBase(kb)}
                      className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                    >
                      Add Content
                    </button>
                    <button
                      onClick={() => deleteKnowledgeBase(kb.id)}
                      className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Content Modal */}
      {selectedKnowledgeBase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Add Content to "{selectedKnowledgeBase.name}"
            </h3>

            <textarea
              value={additionalText}
              onChange={(e) => setAdditionalText(e.target.value)}
              className="mb-4 h-32 w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Enter additional content..."
            />

            <div className="flex space-x-3">
              <button
                onClick={() =>
                  addTextToKnowledgeBase(
                    selectedKnowledgeBase.id,
                    additionalText,
                  )
                }
                disabled={loading || !additionalText.trim()}
                className="flex-1 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Content'}
              </button>
              <button
                onClick={() => {
                  setSelectedKnowledgeBase(null);
                  setAdditionalText('');
                }}
                className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## 📋 Usage Examples

### Basic Usage

```javascript
// pages/knowledge-base.js
import KnowledgeBaseManager from '../components/KnowledgeBaseManager';

export default function KnowledgeBasePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <KnowledgeBaseManager />
    </div>
  );
}
```

### API Integration

```javascript
// hooks/useKnowledgeBase.js
import { useCallback, useState } from 'react';

const EDGE_FUNCTIONS_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1';

export function useKnowledgeBase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createFromText = useCallback(async (name, text, description = '') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-knowledge-base/text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ name, text, description }),
        },
      );

      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createFromUrl = useCallback(async (url, name = '') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-knowledge-base/url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ url, name }),
        },
      );

      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listKnowledgeBases = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-knowledge-base`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        },
      );

      const result = await response.json();
      if (result.success) {
        return result.data.knowledge_bases || [];
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createFromText,
    createFromUrl,
    listKnowledgeBases,
  };
}
```

## 🚀 Deployment

```bash
# Deploy the knowledge base function
supabase functions deploy elevenlabs-knowledge-base

# Set environment variables
supabase secrets set ELEVENLABS_API_KEY=your_api_key
```

## 📋 API Endpoints

### Create from Text

**POST** `/functions/v1/elevenlabs-knowledge-base/text`

```json
{
  "name": "Fundraising FAQ",
  "text": "Q: How can I donate?\nA: You can donate online, by phone, or by mail...",
  "description": "Common fundraising questions and answers"
}
```

### Create from URL

**POST** `/functions/v1/elevenlabs-knowledge-base/url`

```json
{
  "url": "https://example.com/fundraising-faq",
  "name": "Fundraising FAQ from Website"
}
```

### Add Text to Knowledge Base

**POST** `/functions/v1/elevenlabs-knowledge-base/{id}/text`

```json
{
  "text": "Additional content to add to the knowledge base..."
}
```

### List Knowledge Bases

**GET** `/functions/v1/elevenlabs-knowledge-base`

### Delete Knowledge Base

**DELETE** `/functions/v1/elevenlabs-knowledge-base/{id}`

This component provides a complete interface for users to create and manage ElevenLabs Knowledge Bases from various sources! 🎯
