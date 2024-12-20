import { test } from "node:test";
import { deepStrictEqual } from "node:assert";

import { minifyHtml } from "./template.ts";

test("minifyHtml() trim whitespace", () => {
  const html = "   <div><span>Hello, World!</span></div>  ";
  const expected = "<div><span>Hello, World!</span></div>";
  const actual = minifyHtml(html);
  deepStrictEqual(actual, expected);
});

test("minifyHtml() removes comments", () => {
  const html = "<div><!-- comment --></div>";
  const expected = "<div></div>";
  const actual = minifyHtml(html);
  deepStrictEqual(actual, expected);
});

test("minifyHtml() removes multiline comments", () => {
  const html = "<div><!--\ncomment\n--></div>";
  const expected = "<div></div>";
  const actual = minifyHtml(html);
  deepStrictEqual(actual, expected);
});
