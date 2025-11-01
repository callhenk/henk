# Knowledge Base Management Component

## 🎯 Overview

This component allows users to create and manage ElevenLabs Knowledge Bases from text, URLs, and other sources based on the [ElevenLabs Knowledge Base API](https://elevenlabs.io/docs/api-reference/knowledge-base/create-from-text).

## 🚀 React Component

```javascript
// components/KnowledgeBaseManager.js
import React, { useState, useEffect } from "react";

const EDGE_FUNCTIONS_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL + "/functions/v1";

export default function KnowledgeBaseManager() {
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
  const [formData, setFormData] = useState({
    name: "",
    text: "",
    url: "",
    description: "",
    file: null,
  });
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState(null);
  const [additionalText, setAdditionalText] = useState("");

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
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setKnowledgeBases(result.data.knowledge_bases || []);
      }
    } catch (error) {
      console.error("Error loading knowledge bases:", error);
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
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            name: formData.name,
            text: formData.text,
            description: formData.description,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("Knowledge base created successfully!");
        setFormData({
          name: "",
          text: "",
          url: "",
          description: "",
          file: null,
        });
        loadKnowledgeBases();
      } else {
        alert("Error creating knowledge base: " + result.error);
      }
    } catch (error) {
      console.error("Error creating knowledge base:", error);
      alert("Error creating knowledge base");
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
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            url: formData.url,
            name: formData.name,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("Knowledge base created from URL!");
        setFormData({
          name: "",
          text: "",
          url: "",
          description: "",
          file: null,
        });
        loadKnowledgeBases();
      } else {
        alert("Error creating knowledge base: " + result.error);
      }
    } catch (error) {
      console.error("Error creating knowledge base from URL:", error);
      alert("Error creating knowledge base from URL");
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
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("Text added to knowledge base successfully!");
        setAdditionalText("");
        loadKnowledgeBases();
      } else {
        alert("Error adding text: " + result.error);
      }
    } catch (error) {
      console.error("Error adding text to knowledge base:", error);
      alert("Error adding text to knowledge base");
    } finally {
      setLoading(false);
    }
  };

  const deleteKnowledgeBase = async (knowledgeBaseId) => {
    if (!confirm("Are you sure you want to delete this knowledge base?")) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-knowledge-base/${knowledgeBaseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("Knowledge base deleted successfully!");
        loadKnowledgeBases();
      } else {
        alert("Error deleting knowledge base: " + result.error);
      }
    } catch (error) {
      console.error("Error deleting knowledge base:", error);
      alert("Error deleting knowledge base");
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
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Knowledge Base Manager</h1>

      {/* Create Knowledge Base Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Create New Knowledge Base
        </h2>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("text")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "text"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            From Text
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "url"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            From URL
          </button>
          <button
            onClick={() => setActiveTab("file")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "file"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            From File
          </button>
        </div>

        {/* Create from Text */}
        {activeTab === "text" && (
          <form onSubmit={createFromText} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Knowledge Base Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a name for your knowledge base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the knowledge base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-48"
                placeholder="Enter your knowledge base content here..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Creating..." : "Create Knowledge Base"}
            </button>
          </form>
        )}

        {/* Create from URL */}
        {activeTab === "url" && (
          <form onSubmit={createFromUrl} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Knowledge Base Name (Optional)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a name for your knowledge base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/fundraising-faq"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Creating..." : "Create from URL"}
            </button>
          </form>
        )}

        {/* Create from File */}
        {activeTab === "file" && (
          <form onSubmit={createFromText} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Knowledge Base Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a name for your knowledge base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the knowledge base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Upload File
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                accept=".txt,.md,.doc,.docx"
              />
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: .txt, .md, .doc, .docx
              </p>
            </div>

            {formData.text && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  File Content Preview
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                  placeholder="File content will appear here..."
                  readOnly
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !formData.text}
              className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Creating..." : "Create from File"}
            </button>
          </form>
        )}
      </div>

      {/* Knowledge Bases List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your Knowledge Bases</h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading knowledge bases...</p>
          </div>
        ) : knowledgeBases.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No knowledge bases found. Create your first one above!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {knowledgeBases.map((kb) => (
              <div
                key={kb.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{kb.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {kb.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
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
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Add Content
                    </button>
                    <button
                      onClick={() => deleteKnowledgeBase(kb.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Add Content to "{selectedKnowledgeBase.name}"
            </h3>

            <textarea
              value={additionalText}
              onChange={(e) => setAdditionalText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 mb-4"
              placeholder="Enter additional content..."
            />

            <div className="flex space-x-3">
              <button
                onClick={() =>
                  addTextToKnowledgeBase(
                    selectedKnowledgeBase.id,
                    additionalText
                  )
                }
                disabled={loading || !additionalText.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Content"}
              </button>
              <button
                onClick={() => {
                  setSelectedKnowledgeBase(null);
                  setAdditionalText("");
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
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
import KnowledgeBaseManager from "../components/KnowledgeBaseManager";

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
import { useState, useCallback } from "react";

const EDGE_FUNCTIONS_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL + "/functions/v1";

export function useKnowledgeBase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createFromText = useCallback(async (name, text, description = "") => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-knowledge-base/text`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ name, text, description }),
        }
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

  const createFromUrl = useCallback(async (url, name = "") => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-knowledge-base/url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ url, name }),
        }
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
        }
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
