import { test } from "node:test";
import { deepStrictEqual } from "node:assert";

import { includeFilesIf, setFileReader } from "./template.ts";

test("includeFilesIf() single include", async () => {
  const html = "<div><!-- includeIf(isInclude, filename.txt); --></div>";
  const viewModel = { isInclude: true };
  const fileReader = (filename: string): Promise<string> => {
    return new Promise((resolve) => resolve(`Hello, ${filename}!`));
  };
  setFileReader(fileReader);
  const actual = await includeFilesIf(html, ".", viewModel);
  const expected = "<div>Hello, filename.txt!</div>";
  deepStrictEqual(actual, expected);
});

test("includeFilesIf() include false", async () => {
  const html = "<div><!-- includeIf(isInclude, filename.txt); --></div>";
  const viewModel = { isInclude: false };
  const fileReader = (filename: string): Promise<string> => {
    void filename;
    throw new Error("File should not be included");
  };
  setFileReader(fileReader);
  const actual = await includeFilesIf(html, ".", viewModel);
  const expected = "<div></div>";
  deepStrictEqual(actual, expected);
});

test("includeFilesIf() missing file", async () => {
  const html = "<div><!-- includeIf(isInclude, missing.txt); --></div>";
  const viewModel = { isInclude: true };
  const fileReader = (filename: string): Promise<string> => {
    void filename;
    return new Promise((_, reject) => reject(new Error("File not found")));
  };
  setFileReader(fileReader);
  const actual = await includeFilesIf(html, ".", viewModel);
  const expected = "<div></div>";
  deepStrictEqual(actual, expected);
});
