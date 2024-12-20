import { test } from "node:test";
import { deepStrictEqual } from "node:assert";

import { renderIf } from "./template.ts";

test("renderIf() single render", () => {
  const html =
    "<div><!-- renderIf(show); -->Hello, World!<!-- endIf(); --></div>";
  const viewModel = { show: true };
  const expected = "<div>Hello, World!</div>";
  const actual = renderIf(html, viewModel);
  deepStrictEqual(actual, expected);
});

test("renderIf() multiple renders", () => {
  const html = "<div><!-- renderIf(show); -->" +
    "Hello,<!-- endIf(); -->" +
    " <!-- renderIf(show); -->" +
    "World!<!-- endIf(); --></div>";
  const viewModel = { show: true };
  const expected = "<div>Hello, World!</div>";
  const actual = renderIf(html, viewModel);
  deepStrictEqual(actual, expected);
});

test("renderIf() no render", () => {
  const html =
    "<div><!-- renderIf(show); -->Hello, World!<!-- endIf(); --></div>";
  const viewModel = { show: false };
  const expected = "<div></div>";
  const actual = renderIf(html, viewModel);
  deepStrictEqual(actual, expected);
});
