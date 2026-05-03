/* eslint-disable hersa-style/require-scss-module */
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/utils";
import { StatusChip } from "./StatusChip";
import type { StatusChipConfig } from "./types";

describe("StatusChip", () => {
  const mockStatusMap: Record<string, StatusChipConfig> = {
    pending: { label: "Pendiente", color: "warning" },
    completed: { label: "Completado", color: "success" },
    failed: { label: "Error", color: "error" },
    processing: { label: "En proceso", color: "info" },
  };

  it("renders chip with label from statusMap when status is found", () => {
    renderWithProviders(
      <StatusChip status="pending" statusMap={mockStatusMap} />
    );

    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("renders chip with different label from statusMap", () => {
    renderWithProviders(
      <StatusChip status="completed" statusMap={mockStatusMap} />
    );

    expect(screen.getByText("Completado")).toBeInTheDocument();
  });

  it("renders chip with raw status string when NOT in statusMap", () => {
    renderWithProviders(
      <StatusChip status="unknown_status" statusMap={mockStatusMap} />
    );

    expect(screen.getByText("unknown_status")).toBeInTheDocument();
  });

  it("renders chip with raw status when statusMap is empty", () => {
    renderWithProviders(
      <StatusChip status="any_status" statusMap={{}} />
    );

    expect(screen.getByText("any_status")).toBeInTheDocument();
  });

  it("uses small size by default", () => {
    const { container } = renderWithProviders(
      <StatusChip status="pending" statusMap={mockStatusMap} />
    );

    const chip = container.querySelector(".MuiChip-sizeSmall");
    expect(chip).toBeInTheDocument();
  });

  it("renders chip with small size when explicitly set", () => {
    const { container } = renderWithProviders(
      <StatusChip status="pending" statusMap={mockStatusMap} size="small" />
    );

    const chip = container.querySelector(".MuiChip-sizeSmall");
    expect(chip).toBeInTheDocument();
  });

  it("renders chip with medium size when specified", () => {
    const { container } = renderWithProviders(
      <StatusChip status="pending" statusMap={mockStatusMap} size="medium" />
    );

    const chip = container.querySelector(".MuiChip-sizeMedium");
    expect(chip).toBeInTheDocument();
  });

  it("applies correct semantic color from statusMap", () => {
    const { container } = renderWithProviders(
      <StatusChip status="pending" statusMap={mockStatusMap} />
    );

    const chip = container.querySelector(".MuiChip-colorWarning");
    expect(chip).toBeInTheDocument();
  });

  it("renders error status with error color", () => {
    const { container } = renderWithProviders(
      <StatusChip status="failed" statusMap={mockStatusMap} />
    );

    const chip = container.querySelector(".MuiChip-colorError");
    expect(chip).toBeInTheDocument();
  });

  it("renders success status with success color", () => {
    const { container } = renderWithProviders(
      <StatusChip status="completed" statusMap={mockStatusMap} />
    );

    const chip = container.querySelector(".MuiChip-colorSuccess");
    expect(chip).toBeInTheDocument();
  });

  it("renders with default color when status not in map", () => {
    const { container } = renderWithProviders(
      <StatusChip status="unknown" statusMap={mockStatusMap} />
    );

    const chip = container.querySelector(".MuiChip-colorDefault");
    expect(chip).toBeInTheDocument();
  });

  it("renders filled variant", () => {
    const { container } = renderWithProviders(
      <StatusChip status="pending" statusMap={mockStatusMap} />
    );

    const chip = container.querySelector(".MuiChip-filled");
    expect(chip).toBeInTheDocument();
  });

  it("handles multiple status values correctly", () => {
    const { rerender } = renderWithProviders(
      <StatusChip status="pending" statusMap={mockStatusMap} />
    );

    expect(screen.getByText("Pendiente")).toBeInTheDocument();

    rerender(
      <StatusChip status="completed" statusMap={mockStatusMap} />
    );

    expect(screen.getByText("Completado")).toBeInTheDocument();
  });

  it("renders with info color", () => {
    const { container } = renderWithProviders(
      <StatusChip status="processing" statusMap={mockStatusMap} />
    );

    const chip = container.querySelector(".MuiChip-colorInfo");
    expect(chip).toBeInTheDocument();
  });

  it("renders chip as MUI component", () => {
    const { container } = renderWithProviders(
      <StatusChip status="pending" statusMap={mockStatusMap} />
    );

    const chip = container.querySelector(".MuiChip-root");
    expect(chip).toBeInTheDocument();
  });
});
