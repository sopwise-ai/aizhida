import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppProviders } from "./app-providers";

describe("app providers", () => {
  it("renders children inside the provider stack", () => {
    render(
      <AppProviders>
        <p data-testid="leaf">content</p>
      </AppProviders>,
    );

    expect(screen.getByTestId("leaf")).toBeInTheDocument();
  });
});
