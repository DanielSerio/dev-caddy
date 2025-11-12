import DOMPurify from 'dompurify';

/**
 * Sanitizes user-provided content to prevent XSS attacks
 *
 * **SECURITY WARNING:**
 * Always use this function before rendering user-generated content.
 * This prevents malicious HTML/JavaScript injection attacks.
 *
 * Configuration:
 * - Plain text only (no HTML tags allowed)
 * - Strips all formatting, scripts, and event handlers
 * - Safe for rendering in React components
 *
 * @param content - Raw user input to sanitize
 * @returns Sanitized plain text safe for rendering
 *
 * @example
 * ```typescript
 * // Dangerous user input
 * const userInput = '<script>alert("XSS")</script>Hello';
 *
 * // Safe sanitized output
 * const safe = sanitizeContent(userInput);
 * console.log(safe); // "Hello"
 * ```
 *
 * @example
 * ```tsx
 * // Using in React component
 * function AnnotationDisplay({ annotation }) {
 *   const safeContent = sanitizeContent(annotation.content);
 *   return <p>{safeContent}</p>;
 * }
 * ```
 */
export function sanitizeContent(content: string): string {
  // Configure DOMPurify to allow plain text only
  const config = {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content even when stripping tags
  };

  // Sanitize and return plain text
  return DOMPurify.sanitize(content, config);
}
