import {expect} from "chai";
import {matches, matchesLength, extract} from "./matches.js";

// Function for matching string literal
const isStringLiteral = matches({
  "type": "Literal",
  // Unlike in Lodash.matches(),
  // we can provide a function to assert if object field matches.
  "value": (v) => typeof v === 'string',
});

// Function for matching: <local> = require(<source>)
const isRequireDeclarator = matches({
  "type": "VariableDeclarator",
  // Store the matching identifier under key: "local"
  "id": extract("local", {
    "type": "Identifier",
  }),
  "init": {
    "type": "CallExpression",
    "callee": {
      "type": "Identifier",
      "name": "require"
    },
    "arguments": matchesLength([
      // Store the matching string literal under key: "source"
      extract("source", isStringLiteral),
    ]),
  },
});

// Function for matching: var <local> = require(<source>)
const isRequire = matches({
  "type": "VariableDeclaration",
  // Match array of exactly 1 element (not 1 or more elements, which is the default)
  "declarations": matchesLength([
    isRequireDeclarator,
  ]),
  "kind": "var",
});

describe("f-matches", () => {
  it("returns false when obviously no match", () => {
    expect(isStringLiteral({})).to.be.false;
  });

  it("returns false condition doesn't match", () => {
    expect(isStringLiteral({
      "type": "Literal",
      "value": 10,
    })).to.be.false;
  });

  it("returns empty object when condition matches", () => {
    expect(isStringLiteral({
      "type": "Literal",
      "value": "Hello, world!",
    })).to.deep.equal({});
  });

  it("returns object with captures when extract() used", () => {
    expect(isRequire({
      "type": "VariableDeclaration",
      "kind": "var",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "foo",
          },
          "init": {
            "type": "CallExpression",
            "callee": {
              "type": "Identifier",
              "name": "require"
            },
            "arguments": [{
              "type": "Literal",
              "value": "./foo.js",
              "raw": '"./foo.js"',
            }],
          },
        },
      ],
    })).to.deep.equal({
      local: {
        "type": "Identifier",
        "name": "foo",
      },
      source: {
        "type": "Literal",
        "value": "./foo.js",
        "raw": '"./foo.js"',
      }
    });
  });

  it("matches() succeeds when array has at least the needed amount of elements", () => {
    expect(matches(["foo", "bar"], ["foo", "bar", "baz"])).to.deep.equal({});
  });

  it("matchesLength() fails when array lengths don't equal", () => {
    expect(matchesLength(["foo", "bar"], ["foo", "bar", "baz"])).to.be.false;
  });

  it("matches() succeeds when array lengths equal", () => {
    expect(matches(["foo", "bar"], ["foo", "bar"])).to.deep.equal({});
  });
});
