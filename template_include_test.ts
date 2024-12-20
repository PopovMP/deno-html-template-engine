import { test } from "node:test";
import { deepStrictEqual } from "node:assert";

import { includeFiles, setFileReader } from "./template.ts";

test("includeFiles() single include", async () => {
  const html = "<div><!-- include(file.txt); --></div>";
  const fileReader = (filename: string): Promise<string> => {
    deepStrictEqual(filename, "file.txt");
    return new Promise((resolve) => resolve("Hello, World!"));
  };
  setFileReader(fileReader);
  const expected = "<div>Hello, World!</div>";
  const actual = await includeFiles(html, ".");
  deepStrictEqual(actual, expected);
});

test("includeFiles() multiple includes in a single elems", async () => {
  const html =
    "<div><!-- include(file1.txt); --> <!-- include(file2.txt); --></div>";
  const fileReader = (filename: string): Promise<string> => {
    return new Promise((resolve) => resolve(`Hello, ${filename}!`));
  };
  setFileReader(fileReader);
  const expected = "<div>Hello, file1.txt! Hello, file2.txt!</div>";
  const actual = await includeFiles(html, ".");
  deepStrictEqual(actual, expected);
});

test("includeFiles() multiple includes in separate elems", async () => {
  const html = "<div><!-- include(file3.txt); --></div>" +
    "<div><!-- include(file4.txt); --></div>";
  const fileReader = (filename: string): Promise<string> => {
    return new Promise((resolve) => resolve(`Hello, ${filename}!`));
  };
  setFileReader(fileReader);
  const expected = "<div>Hello, file3.txt!</div>" +
    "<div>Hello, file4.txt!</div>";
  const actual = await includeFiles(html, ".");
  deepStrictEqual(actual, expected);
});

test("includeFiles() missing file", async () => {
  const html = "<div><!-- include(missing.txt); --></div>";
  const fileReader = (filename: string): Promise<string> => {
    void filename;
    return new Promise((_, reject) => reject(new Error("File not found")));
  };
  setFileReader(fileReader);
  const expected = "<div></div>";
  const actual = await includeFiles(html, ".");
  deepStrictEqual(actual, expected);
});

test("includeFiles() error reading file", async () => {
  const html = "<div><!-- include(file.txt); --></div>";
  const fileReader = (filename: string): Promise<string> => {
    void filename;
    return new Promise((_, reject) => reject(new Error("Permission denied")));
  };
  setFileReader(fileReader);
  const expected = "<div></div>";
  const actual = await includeFiles(html, ".");
  deepStrictEqual(actual, expected);
});

test("includeFiles() no includes", async () => {
  const html = "<div>Hello, World!</div>";
  const expected = "<div>Hello, World!</div>";
  const actual = await includeFiles(html, ".");
  deepStrictEqual(actual, expected);
});

test("includeFiles() empty string", async () => {
  const html = "";
  const expected = "";
  const actual = await includeFiles(html, ".");
  deepStrictEqual(actual, expected);
});

test("includeFiles() multiple occurrences", async () => {
  const html =
    "<div><!-- include(file.txt); --></div><p><!-- include(file.txt); --></p>";
  const fileReader = (filename: string): Promise<string> => {
    return new Promise((resolve) => resolve(`Hello, ${filename}!`));
  };
  setFileReader(fileReader);
  const expected = "<div>Hello, file.txt!</div><p>Hello, file.txt!</p>";
  const actual = await includeFiles(html, ".");
  deepStrictEqual(actual, expected);
});
