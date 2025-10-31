/**
 * SchemaScript Component
 * Injects JSON-LD structured data into the page head
 * Use this component in your pages to add schema markup
 */

interface SchemaScriptProps {
  schema: Record<string, unknown>;
}

export function SchemaScript({ schema }: SchemaScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      suppressHydrationWarning
    />
  );
}
