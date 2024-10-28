import { replacePlaceholders } from "./template.ts";

function assertEquals(actual: string, expected: string, msg?: string): void {
  if (actual !== expected) {
    throw new Error(msg || `Expected "${expected}", got "${actual}"`);
  }
}

Deno.test("replacePlaceholders() existing property", () => {
  const html = "<h1><!-- title --></h1>";
  const viewModel = { title: "Hello, World!" };
  const expected = "<h1>Hello, World!</h1>";
  const actual = replacePlaceholders(html, viewModel);
  assertEquals(actual, expected);
});

Deno.test("replacePlaceholders() undefined property", () => {
  const html = "<p><!-- conent --></p>";
  const viewModel = { foo: "bar" };
  const expected = "<p><!-- conent --></p>";
  const actual = replacePlaceholders(html, viewModel);
  assertEquals(actual, expected);
});

Deno.test("replacePlaceholders() multiple properties", () => {
  const html = "<h1><!-- title --></h1><p><!-- content --></p>";
  const viewModel = { title: "Hello, World!", content: "Welcome!" };
  const expected = "<h1>Hello, World!</h1><p>Welcome!</p>";
  const actual = replacePlaceholders(html, viewModel);
  assertEquals(actual, expected);
});

Deno.test("replacePlaceholders() multiple occurrences", () => {
  const html = "<h1><!-- title --></h1><p><!-- title --></p>";
  const viewModel = { title: "Hello, World!" };
  const expected = "<h1>Hello, World!</h1><p>Hello, World!</p>";
  const actual = replacePlaceholders(html, viewModel);
  assertEquals(actual, expected);
});

Deno.test("replacePlaceholders() empty string", () => {
  const html = "";
  const viewModel = { title: "Hello, World!" };
  const expected = "";
  const actual = replacePlaceholders(html, viewModel);
  assertEquals(actual, expected);
});

Deno.test("replacePlaceholders() no placeholders", () => {
  const html = "<h1>Hello, World!</h1>";
  const viewModel = { title: "Hello, World!" };
  const expected = "<h1>Hello, World!</h1>";
  const actual = replacePlaceholders(html, viewModel);
  assertEquals(actual, expected);
});
