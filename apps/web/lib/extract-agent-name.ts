/**
 * Extract agent name from context prompt using simple pattern matching
 * Free and instant - no API calls needed
 */
export function extractAgentName(prompt: string): string | null {
  if (!prompt || prompt.trim().length < 10) {
    return null;
  }

  // Try common patterns for extracting names
  const patterns = [
    // "Your name is Sarah" or "You are called Alex"
    /(?:your name is|you are called|you're called|call(?:ed)? you)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    // "My name is Jamie" or "I am Chris"
    /(?:my name is|I am|I'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    // "Name: Sarah"
    /(?:name:)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match && match[1]) {
      const extractedName = match[1].trim();
      // Ensure it's not a generic role (contains common role keywords)
      const roleKeywords =
        /agent|assistant|specialist|coordinator|support|representative|rep/i;
      if (!roleKeywords.test(extractedName)) {
        return extractedName;
      }
    }
  }

  return null;
}
