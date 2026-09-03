import "../../../../theme"; // registers themes/breakpoints as a side effect
import React, { useState } from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { CodeInput } from "../CodeInput";

function Controlled({ error }: { error?: string | null }) {
  const [value, setValue] = useState("");
  return <CodeInput length={6} group={3} value={value} onChange={setValue} error={error} />;
}

describe("CodeInput", () => {
  it("renders 6 digit slots", async () => {
    await render(<Controlled />);
    expect(screen.getAllByTestId(/code-input-/)).toHaveLength(6);
  });

  it("fills a digit and calls onChange with the full padded value", async () => {
    const onChange = jest.fn();
    await render(<CodeInput length={6} group={3} value="" onChange={onChange} />);
    const firstInput = screen.getByTestId("code-input-0");
    fireEvent.changeText(firstInput, "a");
    expect(onChange).toHaveBeenCalledWith("A");
  });

  it("clears the current digit on backspace when it has a value", async () => {
    const onChange = jest.fn();
    await render(<CodeInput length={6} group={3} value="AB1" onChange={onChange} />);
    const secondInput = screen.getByTestId("code-input-1");
    fireEvent(secondInput, "keyPress", { nativeEvent: { key: "Backspace" } });
    expect(onChange).toHaveBeenCalledWith("A1");
  });
});
