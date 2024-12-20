import { test } from "node:test";
import { deepStrictEqual } from "node:assert";

import { replacePlaceholders } from "./template.ts";

test("replacePlaceholders() existing property", () => {
  const html = "<h1><!-- title --></h1>";
  const viewModel = { title: "Hello, World!" };
  const expected = "<h1>Hello, World!</h1>";
  const actual = replacePlaceholders(html, viewModel);
  deepStrictEqual(actual, expected);
});

test("replacePlaceholders() undefined property", () => {
  const html = "<p><!-- content --></p>";
  const viewModel = { foo: "bar" };
  const expected = "<p><!-- content --></p>";
  const actual = replacePlaceholders(html, viewModel);
  deepStrictEqual(actual, expected);
});

test("replacePlaceholders() multiple properties", () => {
  const html = "<h1><!-- title --></h1><p><!-- content --></p>";
  const viewModel = { title: "Hello, World!", content: "Welcome!" };
  const expected = "<h1>Hello, World!</h1><p>Welcome!</p>";
  const actual = replacePlaceholders(html, viewModel);
  deepStrictEqual(actual, expected);
});

test("replacePlaceholders() multiple occurrences", () => {
  const html = "<h1><!-- title --></h1><p><!-- title --></p>";
  const viewModel = { title: "Hello, World!" };
  const expected = "<h1>Hello, World!</h1><p>Hello, World!</p>";
  const actual = replacePlaceholders(html, viewModel);
  deepStrictEqual(actual, expected);
});

test("replacePlaceholders() empty string", () => {
  const html = "";
  const viewModel = { title: "Hello, World!" };
  const expected = "";
  const actual = replacePlaceholders(html, viewModel);
  deepStrictEqual(actual, expected);
});

test("replacePlaceholders() no placeholders", () => {
  const html = "<h1>Hello, World!</h1>";
  const viewModel = { title: "Hello, World!" };
  const expected = "<h1>Hello, World!</h1>";
  const actual = replacePlaceholders(html, viewModel);
  deepStrictEqual(actual, expected);
});
