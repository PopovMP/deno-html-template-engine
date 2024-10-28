import { renderIf } from "./template.ts";

function assertEquals(actual: string, expected: string, msg?: string): void {
  if (actual !== expected) {
    throw new Error(msg || `Expected "${expected}", got "${actual}"`);
  }
}

Deno.test("renderIf() single render", () => {
  const html =
    "<div><!-- renderIf(show); -->Hello, World!<!-- endIf(); --></div>";
  const viewModel = { show: true };
  const expected = "<div>Hello, World!</div>";
  const actual = renderIf(html, viewModel);
  assertEquals(actual, expected);
});

Deno.test("renderIf() multiple renders", () => {
  const html = "<div><!-- renderIf(show); -->" +
    "Hello,<!-- endIf(); -->" +
    " <!-- renderIf(show); -->" +
    "World!<!-- endIf(); --></div>";
  const viewModel = { show: true };
  const expected = "<div>Hello, World!</div>";
  const actual = renderIf(html, viewModel);
  assertEquals(actual, expected);
});

Deno.test("renderIf() no render", () => {
  const html =
    "<div><!-- renderIf(show); -->Hello, World!<!-- endIf(); --></div>";
  const viewModel = { show: false };
  const expected = "<div></div>";
  const actual = renderIf(html, viewModel);
  assertEquals(actual, expected);
});
