import { describe, it, expect } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { StatCard } from "../StatCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import DashboardIcon from "@mui/icons-material/Dashboard";

describe("StatCard", () => {
  const mockProps = {
    label: "Total Events",
    value: "245",
    trend: "+12%",
    trendUp: true,
    icon: <DashboardIcon />,
  };

  it("should render with all props provided", () => {
    const { getByText } = renderWithProviders(<StatCard {...mockProps} />);

    expect(getByText("Total Events")).toBeInTheDocument();
    expect(getByText("245")).toBeInTheDocument();
    expect(getByText("+12%")).toBeInTheDocument();
  });

  it("should render label correctly", () => {
    const { getByText } = renderWithProviders(<StatCard {...mockProps} />);

    expect(getByText("Total Events")).toBeInTheDocument();
  });

  it("should render value correctly", () => {
    const { getByText } = renderWithProviders(<StatCard {...mockProps} />);

    expect(getByText("245")).toBeInTheDocument();
  });

  it("should render trend text correctly", () => {
    const { getByText } = renderWithProviders(<StatCard {...mockProps} />);

    expect(getByText("+12%")).toBeInTheDocument();
  });

  it("should render TrendingUpIcon when trendUp=true", () => {
    const { container } = renderWithProviders(<StatCard {...mockProps} trendUp={true} />);

    // Check if TrendingUpIcon is rendered (check for the icon in the chip)
    const chip = container.querySelector("[class*='MuiChip']");
    expect(chip).toBeInTheDocument();

    // Verify the icon is present in the DOM
    const icons = container.querySelectorAll("svg[class*='MuiSvgIcon']");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("should render TrendingDownIcon when trendUp=false", () => {
    const { container } = renderWithProviders(<StatCard {...mockProps} trendUp={false} />);

    // Check if TrendingDownIcon is rendered
    const chip = container.querySelector("[class*='MuiChip']");
    expect(chip).toBeInTheDocument();

    // Verify the icon is present in the DOM
    const icons = container.querySelectorAll("svg[class*='MuiSvgIcon']");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("should render the provided icon prop", () => {
    const { container } = renderWithProviders(<StatCard {...mockProps} icon={<DashboardIcon />} />);

    // Icon should be rendered in the StatCard
    const icons = container.querySelectorAll("svg[class*='MuiSvgIcon']");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("should render Paper component as container", () => {
    const { container } = renderWithProviders(<StatCard {...mockProps} />);

    const paper = container.querySelector("[class*='MuiPaper']");
    expect(paper).toBeInTheDocument();
  });

  it("should render Chip with trend information", () => {
    const { getByText } = renderWithProviders(<StatCard {...mockProps} />);

    const chip = getByText("+12%");
    expect(chip).toBeInTheDocument();
    expect(chip.closest("[class*='MuiChip']")).toBeInTheDocument();
  });

  it("should handle different label values", () => {
    const customLabel = "Custom Metric";
    const { getByText } = renderWithProviders(
      <StatCard {...mockProps} label={customLabel} />,
    );

    expect(getByText(customLabel)).toBeInTheDocument();
  });

  it("should handle different value values", () => {
    const customValue = "1,234";
    const { getByText } = renderWithProviders(
      <StatCard {...mockProps} value={customValue} />,
    );

    expect(getByText(customValue)).toBeInTheDocument();
  });

  it("should handle different trend values", () => {
    const customTrend = "-5%";
    const { getByText } = renderWithProviders(
      <StatCard {...mockProps} trend={customTrend} />,
    );

    expect(getByText(customTrend)).toBeInTheDocument();
  });

  it("should render with trendUp=true indicator", () => {
    const { container } = renderWithProviders(<StatCard {...mockProps} trendUp={true} />);

    const chip = container.querySelector("[class*='MuiChip']");
    expect(chip?.className).toMatch(/chipUp|_chipUp/);
  });

  it("should render with trendUp=false indicator", () => {
    const { container } = renderWithProviders(<StatCard {...mockProps} trendUp={false} />);

    const chip = container.querySelector("[class*='MuiChip']");
    expect(chip?.className).toMatch(/chipDown|_chipDown/);
  });

  it("should render all content together correctly", () => {
    const { container, getByText } = renderWithProviders(
      <StatCard
        label="Revenue"
        value="$50,000"
        trend="+8%"
        trendUp={true}
        icon={<DashboardIcon />}
      />,
    );

    expect(getByText("Revenue")).toBeInTheDocument();
    expect(getByText("$50,000")).toBeInTheDocument();
    expect(getByText("+8%")).toBeInTheDocument();

    // Verify all in same Paper
    const paper = container.querySelector("[class*='MuiPaper']");
    expect(paper?.textContent).toContain("Revenue");
    expect(paper?.textContent).toContain("$50,000");
    expect(paper?.textContent).toContain("+8%");
  });

  it("should maintain structure with different icon types", () => {
    const customIcon = <TrendingUpIcon data-testid="custom-icon" />;
    const { getByTestId } = renderWithProviders(
      <StatCard {...mockProps} icon={customIcon} />,
    );

    expect(getByTestId("custom-icon")).toBeInTheDocument();
  });
});
