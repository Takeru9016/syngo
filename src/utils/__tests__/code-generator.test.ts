import {
  generateRandomCode,
  formatCode,
  unformatCode,
  isValidCodeFormat,
} from "../code-generator";

describe("generateRandomCode", () => {
  it("generates a code of the requested length", () => {
    expect(generateRandomCode(6)).toHaveLength(6);
    expect(generateRandomCode(4)).toHaveLength(4);
  });

  it("only uses unambiguous uppercase alphanumeric characters", () => {
    const code = generateRandomCode(6);
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]+$/);
  });

  it("never contains a blacklisted substring", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateRandomCode(6);
      expect(code).not.toMatch(/69|420|SEX|FUC|SHI|BIC|DIK|ASS|CUM|TIT|VAG|KYS|NIG|FAG|GAY|JEW|KKK/);
    }
  });
});

describe("formatCode", () => {
  it("inserts a hyphen after the third character for 6-character codes", () => {
    expect(formatCode("AB12CD")).toBe("AB1-2CD");
  });

  it("leaves non-6-character codes unchanged", () => {
    expect(formatCode("AB12")).toBe("AB12");
  });
});

describe("unformatCode", () => {
  it("strips non-alphanumeric characters and uppercases", () => {
    expect(unformatCode("ab1-2cd")).toBe("AB12CD");
  });
});

describe("isValidCodeFormat", () => {
  it("accepts a well-formed 6-character code", () => {
    expect(isValidCodeFormat("AB1-2CD")).toBe(true);
  });

  it("rejects a code with the wrong length", () => {
    expect(isValidCodeFormat("AB1-2C")).toBe(false);
  });

  it("rejects a code with invalid characters", () => {
    expect(isValidCodeFormat("AB1-2C!")).toBe(false);
  });
});
