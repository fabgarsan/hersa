import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { JornadaStatusChip } from "./JornadaStatusChip";
import type { JornadaEstado } from "../../types";

describe("JornadaStatusChip", () => {
  describe("status labels", () => {
    it("should render 'Abierta' for open status", () => {
      const status: JornadaEstado = "open";
      render(<JornadaStatusChip status={status} />);
      expect(screen.getByText("Abierta")).toBeInTheDocument();
    });

    it("should render 'Cerrada' for closed status", () => {
      const status: JornadaEstado = "closed";
      render(<JornadaStatusChip status={status} />);
      expect(screen.getByText("Cerrada")).toBeInTheDocument();
    });
  });

  describe("unknown status", () => {
    it("should render 'Desconocido' for unknown status", () => {
      const status = "unknown_status" as JornadaEstado;
      render(<JornadaStatusChip status={status} />);
      expect(screen.getByText("Desconocido")).toBeInTheDocument();
    });

    it("should not render the raw unknown status string", () => {
      const status = "invalid_status" as JornadaEstado;
      render(<JornadaStatusChip status={status} />);
      expect(screen.queryByText("invalid_status")).not.toBeInTheDocument();
    });
  });

  describe("size prop", () => {
    it("should render with small size by default", () => {
      const { container } = render(<JornadaStatusChip status="open" />);
      const chip = container.querySelector(".MuiChip-sizeSmall");
      expect(chip).toBeInTheDocument();
    });

    it("should render with small size when explicitly set", () => {
      const { container } = render(
        <JornadaStatusChip status="open" size="small" />
      );
      const chip = container.querySelector(".MuiChip-sizeSmall");
      expect(chip).toBeInTheDocument();
    });

    it("should render with medium size when specified", () => {
      const { container } = render(
        <JornadaStatusChip status="open" size="medium" />
      );
      const chip = container.querySelector(".MuiChip-sizeMedium");
      expect(chip).toBeInTheDocument();
    });
  });

  describe("color mapping", () => {
    it("should apply info color for open status", () => {
      const { container } = render(<JornadaStatusChip status="open" />);
      const chip = container.querySelector(".MuiChip-colorInfo");
      expect(chip).toBeInTheDocument();
    });

    it("should apply success color for closed status", () => {
      const { container } = render(<JornadaStatusChip status="closed" />);
      const chip = container.querySelector(".MuiChip-colorSuccess");
      expect(chip).toBeInTheDocument();
    });

    it("should apply default color for unknown status", () => {
      const status = "unknown" as JornadaEstado;
      const { container } = render(<JornadaStatusChip status={status} />);
      const chip = container.querySelector(".MuiChip-colorDefault");
      expect(chip).toBeInTheDocument();
    });
  });
});
