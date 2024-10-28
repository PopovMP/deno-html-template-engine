import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { logError } from "@popov/logger";

export type ViewModel = Record<string, string | number | boolean>;

let fileReader: (filename: string) => Promise<string> = (
  filename: string,
): Promise<string> => {
  return readFile(filename, { encoding: "utf8" });
};

/**
 * Template engine - renders HTML templates.
 *
 * Syntax:
 *   <!-- key --> - placeholder for the value from the view model
 *   <!-- include(filename.html); --> - include a file
 *   <!-- includeIf(property, filename.html); --> - include a file conditionally
 *   <!-- renderIf(property); --> ... <!-- endIf(); --> - render content conditionally
 */

/**
 * Set a custom file reader function.
 */
export function setFileReader(
  reader: (filename: string) => Promise<string>,
): void {
  fileReader = reader;
}

/**
 * Render the HTML template with the view model.
 *
 * The template can include placeholders, file includes and conditional rendering.
 *
 * ```typescript
 * const html = "<h1><!-- title --></h1>" +
 *   "<!-- include(hello-world.txt); -->" +
 *   "<!-- includeIf(hello, hello-world.txt); -->" +
 *   "<!-- renderIf(section); -->" +
 *   "  <h2>Section</h2>" +
 *   "<!-- endIf(); -->";
 *
 * const viewModel = { title: "Hello, World!", hello: true, section: true };
 * const result = await renderTemplate(html, viewModel, ".");
 * ```
 */
export async function renderTemplate(
  html: string,
  viewModel: ViewModel,
  baseDir: string,
): Promise<string> {
  html = renderIf(html, viewModel);
  html = replacePlaceholders(html, viewModel);

  html = await includeFilesIf(html, baseDir, viewModel);
  html = await includeFiles(html, baseDir);

  html = renderIf(html, viewModel);
  html = replacePlaceholders(html, viewModel);

  return minifyHtml(html);
}

/**
 * Replace placeholders in the HTML with the values from the view model.
 *
 * Template syntax: `<!-- key -->`
 *
 * Where `key` is a property in the viewModel.
 *
 * ```typescript
 * const html = "<h1><!-- title --></h1>";
 * const viewModel = { title: "Hello, World!" };
 * const result = replacePlaceholders(html, viewModel);
 * console.log(result); // "<h1>Hello, World!</h1>"
 * ```
 */
export function replacePlaceholders(
  html: string,
  viewModel: ViewModel,
): string {
  return html.replace(/<!--\s*(\w+)\s*-->/g, replacer);

  function replacer(match: string, key: string): string {
    return viewModel[key] !== undefined ? String(viewModel[key]) : match;
  }
}

/**
 * Include files in the HTML.
 *
 * Template syntax: `<!-- include(filename.html); -->`
 *
 * ```typescript
 * const html = "<div><!-- include(hello-world.txt); --></div>";
 * const result = await includeFiles(html, ".");
 * console.log(result); // "<div>Hello, World!</div>"
 * ```
 */
export async function includeFiles(
  html: string,
  baseDir: string,
): Promise<string> {
  const includeRegEx = /<!--\s*include\(([^)]+)\);?\s*-->/g;
  const replacements: { match: string; content: string }[] = [];

  let match;
  while ((match = includeRegEx.exec(html)) !== null) {
    const filename = match[1].trim();
    try {
      const filePath = join(baseDir, filename);
      const fileContent = await fileReader(filePath);
      replacements.push({ match: match[0], content: fileContent });
    } catch (error) {
      replacements.push({ match: match[0], content: "" });
      logError(
        `Error including file: ${filename}: ${(error as Error).message}`,
        "html-template-engine :: include",
      );
    }
  }

  for (const { match, content } of replacements) {
    html = html.replaceAll(match, content);
  }

  return html;
}

/**
 * Include files conditionally in the HTML.
 *
 * Template syntax: `<!-- includeIf(isInclude, filename.html); -->`
 *
 * Where `isInclude` is a property in the viewModel.
 *
 * If the property is `true`, the file is loaded and its content replaces the placeholder.
 *
 * ```typescript
 * const html = "<div><!-- includeIf(show, hello-world.txt); --></div>";
 * const viewModel = { show: true };
 * const result = await includeFilesIf(html, ".", viewModel);
 * console.log(result); // "<div>Hello, World!</div>"
 * ```
 */
export async function includeFilesIf(
  html: string,
  baseDir: string,
  viewModel: ViewModel,
): Promise<string> {
  const includeIfRegEx = /<!--\s*includeIf\(([^,]+),([^)]+)\);?\s*-->/g;
  let match;
  while ((match = includeIfRegEx.exec(html)) !== null) {
    const key = match[1].trim();
    const filename = match[2].trim();
    try {
      if (viewModel[key]) {
        const filePath = join(baseDir, filename);
        const fileContent = await fileReader(filePath);
        html = html.replace(match[0], fileContent);
      } else {
        html = html.replace(match[0], "");
      }
    } catch (error) {
      html = html.replace(match[0], "");
      logError(
        `Error including file: ${filename}: ${(error as Error).message}`,
        "html-template-engine :: includeIf",
      );
    }
  }
  return html;
}

/**
 * Render the content conditionally.
 *
 * <h1>Template file</h1>
 * <!-- renderIf(property); -->
 *  <h2>Content to render if the property is true.</h2>
 * <!-- endIf(); -->
 *
 * ```typescript
 * const html = "<h1>Template file</h1>" +
 *   "<!-- renderIf(show); -->" +
 *     "<h2>Shown</h2>" +
 *   "<!-- endIf(); -->" +
 *   "<!-- renderIf(dontShow); -->" +
 *     "<h2>Not shown</h2>" +
 *   "<!-- endIf(); -->";
 * ;
 * const viewModel = { show: true, dontShow: false };
 * const result = renderIf(html, viewModel);
 * console.log(result); // "<h1>Template file</h1><h2>Shown</h2>"
 * ```
 */
export function renderIf(html: string, viewModel: ViewModel): string {
  const renderIfRegEx =
    /<!--\s*renderIf\(([^)]+)\);?\s*-->([\s\S]*?)<!--\s*endIf\(\);?\s*-->/g;

  return html.replace(renderIfRegEx, replacer);

  function replacer(_: string, key: string, content: string): string {
    return viewModel[key] ? content : "";
  }
}

/**
 * Minify the HTML - remove leading spaces, empty lines and trim.
 *
 * ```typescript
 * const html = "   <div><span>Hello, World!</span></div>  ";
 * const expected = "<div><span>Hello, World!</span></div>";
 * const actual = minifyHtml(html);
 * assertEquals(actual, expected);
 * ```
 */
export function minifyHtml(html: string): string {
  // Trim leading spaces and empty lines
  html = html.replace(/^\s+/gm, "").replace(/[\r\n]+/g, "\n").trim();

  // Remove comments
  html = html.replace(/<!--[\s\S]*?-->/g, "");

  return html;
}
