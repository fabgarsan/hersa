import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrdenStatusChip } from "./OrdenStatusChip";
import type { OrdenEstado, OrdenLineaEstado } from "../../types";

describe("OrdenStatusChip", () => {
  describe("PurchaseOrder status labels", () => {
    it("should render 'Iniciada' label for initiated status", () => {
      render(<OrdenStatusChip status="initiated" />);
      expect(screen.getByText("Iniciada")).toBeInTheDocument();
    });

    it("should render 'Pendiente' label for pending status", () => {
      render(<OrdenStatusChip status="pending" />);
      expect(screen.getByText("Pendiente")).toBeInTheDocument();
    });

    it("should render 'Parcial' label for partially_received status", () => {
      render(<OrdenStatusChip status="partially_received" />);
      expect(screen.getByText("Parcial")).toBeInTheDocument();
    });

    it("should render 'Cerrada' label for closed status", () => {
      render(<OrdenStatusChip status="closed" />);
      expect(screen.getByText("Cerrada")).toBeInTheDocument();
    });
  });

  describe("OrderLine status labels", () => {
    it("should render 'Pendiente' label for orderline pending status", () => {
      const status: OrdenLineaEstado = "pending";
      render(<OrdenStatusChip status={status} />);
      expect(screen.getByText("Pendiente")).toBeInTheDocument();
    });

    it("should render 'Parcial' label for orderline partially_received status", () => {
      const status: OrdenLineaEstado = "partially_received";
      render(<OrdenStatusChip status={status} />);
      expect(screen.getByText("Parcial")).toBeInTheDocument();
    });

    it("should render 'Completa' label for orderline complete status", () => {
      const status: OrdenLineaEstado = "complete";
      render(<OrdenStatusChip status={status} />);
      expect(screen.getByText("Completa")).toBeInTheDocument();
    });
  });

  describe("unknown status", () => {
    it("should render the raw unknown status string as fallback", () => {
      render(<OrdenStatusChip status="unknown_status" />);
      expect(screen.getByText("unknown_status")).toBeInTheDocument();
    });

    it("should render unknown status with default color", () => {
      render(<OrdenStatusChip status="some_random_status" />);
      expect(screen.getByText("some_random_status")).toBeInTheDocument();
    });
  });

  describe("size prop", () => {
    it("should render with small size by default", () => {
      const { container } = render(<OrdenStatusChip status="initiated" />);
      const chip = container.querySelector(".MuiChip-sizeSmall");
      expect(chip).toBeInTheDocument();
    });

    it("should render with small size when explicitly set", () => {
      const { container } = render(
        <OrdenStatusChip status="initiated" size="small" />
      );
      const chip = container.querySelector(".MuiChip-sizeSmall");
      expect(chip).toBeInTheDocument();
    });

    it("should render with medium size when specified", () => {
      const { container } = render(
        <OrdenStatusChip status="initiated" size="medium" />
      );
      const chip = container.querySelector(".MuiChip-sizeMedium");
      expect(chip).toBeInTheDocument();
    });
  });

  describe("color mapping", () => {
    it("should apply warning color for initiated status", () => {
      const { container } = render(<OrdenStatusChip status="initiated" />);
      const chip = container.querySelector(".MuiChip-colorWarning");
      expect(chip).toBeInTheDocument();
    });

    it("should apply info color for pending status", () => {
      const { container } = render(<OrdenStatusChip status="pending" />);
      const chip = container.querySelector(".MuiChip-colorInfo");
      expect(chip).toBeInTheDocument();
    });

    it("should apply warning color for partially_received status", () => {
      const { container } = render(
        <OrdenStatusChip status="partially_received" />
      );
      const chip = container.querySelector(".MuiChip-colorWarning");
      expect(chip).toBeInTheDocument();
    });

    it("should apply success color for closed status", () => {
      const { container } = render(<OrdenStatusChip status="closed" />);
      const chip = container.querySelector(".MuiChip-colorSuccess");
      expect(chip).toBeInTheDocument();
    });

    it("should apply success color for complete status", () => {
      const { container } = render(<OrdenStatusChip status="complete" />);
      const chip = container.querySelector(".MuiChip-colorSuccess");
      expect(chip).toBeInTheDocument();
    });

    it("should apply default color for unknown status", () => {
      const { container } = render(<OrdenStatusChip status="some_unknown" />);
      const chip = container.querySelector(".MuiChip-colorDefault");
      expect(chip).toBeInTheDocument();
    });
  });
});
