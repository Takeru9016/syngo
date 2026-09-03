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
    expect(screen.getAllByDisplayValue("")).toHaveLength(6);
  });

  it("fills a digit and calls onChange with the full padded value", async () => {
    const onChange = jest.fn();
    await render(<CodeInput length={6} group={3} value="" onChange={onChange} />);
    const inputs = screen.getAllByDisplayValue("");
    fireEvent.changeText(inputs[0], "a");
    expect(onChange).toHaveBeenCalledWith("A");
  });

  it("clears the current digit on backspace when it has a value", async () => {
    const onChange = jest.fn();
    await render(<CodeInput length={6} group={3} value="AB1" onChange={onChange} />);
    const filled = screen.getByDisplayValue("B");
    fireEvent(filled, "keyPress", { nativeEvent: { key: "Backspace" } });
    expect(onChange).toHaveBeenCalledWith("A1");
  });
});
