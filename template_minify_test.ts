import { minifyHtml } from "./template.ts";

function assertEquals(actual: string, expected: string, msg?: string): void {
  if (actual !== expected) {
    throw new Error(msg || `Expected "${expected}", got "${actual}"`);
  }
}

Deno.test("minifyHtml() trim whitespace", () => {
  const html = "   <div><span>Hello, World!</span></div>  ";
  const expected = "<div><span>Hello, World!</span></div>";
  const actual = minifyHtml(html);
  assertEquals(actual, expected);
});

Deno.test("minifyHtml() removes comments", () => {
  const html = "<div><!-- comment --></div>";
  const expected = "<div></div>";
  const actual = minifyHtml(html);
  assertEquals(actual, expected);
});

Deno.test("minifyHtml() removes multiline comments", () => {
  const html = "<div><!--\ncomment\n--></div>";
  const expected = "<div></div>";
  const actual = minifyHtml(html);
  assertEquals(actual, expected);
});
