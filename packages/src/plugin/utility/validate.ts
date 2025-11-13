import type { DevCaddyPluginOptions } from '../../types/plugin';

/**
 * Validates DevCaddy plugin options
 *
 * Throws clear errors if configuration is invalid, helping developers
 * catch issues early during development.
 *
 * @param options - Plugin options to validate
 * @throws {Error} If options are invalid with descriptive message
 *
 * @example
 * ```typescript
 * try {
 *   validatePluginOptions(options);
 * } catch (error) {
 *   console.error('Invalid DevCaddy configuration:', error.message);
 * }
 * ```
 */
export function validatePluginOptions(options: DevCaddyPluginOptions): void {
  // Validate that options object exists
  if (!options) {
    throw new Error(
      '[DevCaddy] Plugin options are required. ' +
      'Please provide an options object with at least { context, enabled }.'
    );
  }

  // Validate context (required)
  if (!options.context) {
    throw new Error(
      '[DevCaddy] Missing required option: "context". ' +
      'Pass the Vite ConfigEnv object from defineConfig callback:\n\n' +
      'export default defineConfig((context) => ({\n' +
      '  plugins: [DevCaddyPlugin({ context, enabled: true })]\n' +
      '}))'
    );
  }

  // Validate context is ConfigEnv type
  if (typeof options.context !== 'object' || !('mode' in options.context) || !('command' in options.context)) {
    throw new Error(
      '[DevCaddy] Invalid "context" option. ' +
      'Expected Vite ConfigEnv object with { mode, command } properties. ' +
      `Received: ${JSON.stringify(options.context)}`
    );
  }

  // Validate mode is valid
  const validModes = ['development', 'production', 'test'];
  if (!validModes.includes(options.context.mode)) {
    throw new Error(
      '[DevCaddy] Invalid context.mode. ' +
      `Expected one of: ${validModes.join(', ')}. ` +
      `Received: "${options.context.mode}"`
    );
  }

  // Validate command is valid
  const validCommands = ['serve', 'build'];
  if (!validCommands.includes(options.context.command)) {
    throw new Error(
      '[DevCaddy] Invalid context.command. ' +
      `Expected one of: ${validCommands.join(', ')}. ` +
      `Received: "${options.context.command}"`
    );
  }

  // Validate enabled (required)
  if (typeof options.enabled !== 'boolean') {
    throw new Error(
      '[DevCaddy] Invalid "enabled" option. ' +
      'Expected boolean (true or false). ' +
      `Received: ${typeof options.enabled} (${options.enabled})`
    );
  }

  // Validate debug (optional)
  if (options.debug !== undefined && typeof options.debug !== 'boolean') {
    throw new Error(
      '[DevCaddy] Invalid "debug" option. ' +
      'Expected boolean (true or false) or undefined. ' +
      `Received: ${typeof options.debug} (${options.debug})`
    );
  }
}

/**
 * Validates annotation content before submission
 *
 * Ensures annotation content meets requirements:
 * - Non-empty after trimming whitespace
 * - Within maximum length (10,000 characters)
 *
 * @param content - Annotation content to validate
 * @returns Trimmed and validated content
 * @throws {Error} If content is invalid
 *
 * @example
 * ```typescript
 * try {
 *   const validContent = validateAnnotationContent(userInput);
 *   await createAnnotation({ content: validContent, ... });
 * } catch (error) {
 *   alert(error.message);
 * }
 * ```
 */
export function validateAnnotationContent(content: string): string {
  // Validate content is a string
  if (typeof content !== 'string') {
    throw new Error(
      'Annotation content must be a string. ' +
      `Received: ${typeof content}`
    );
  }

  // Trim whitespace
  const trimmed = content.trim();

  // Validate non-empty
  if (trimmed.length === 0) {
    throw new Error('Annotation content cannot be empty.');
  }

  // Validate maximum length (10,000 characters is generous for annotations)
  const MAX_LENGTH = 10000;
  if (trimmed.length > MAX_LENGTH) {
    throw new Error(
      `Annotation content is too long. ` +
      `Maximum ${MAX_LENGTH} characters allowed. ` +
      `Current length: ${trimmed.length} characters.`
    );
  }

  return trimmed;
}

/**
 * Validates CSS selector syntax
 *
 * Checks if a string is a valid CSS selector by attempting to
 * query it against a temporary element. Useful for validating
 * element selectors before storage.
 *
 * @param selector - CSS selector string to validate
 * @returns true if valid, false otherwise
 *
 * @example
 * ```typescript
 * if (isValidSelector('.my-class > button')) {
 *   // Safe to use
 * }
 * ```
 */
export function isValidSelector(selector: string): boolean {
  if (typeof selector !== 'string' || selector.trim().length === 0) {
    return false;
  }

  try {
    // Try to query selector on a temporary element
    document.createDocumentFragment().querySelector(selector);
    return true;
  } catch {
    return false;
  }
}
