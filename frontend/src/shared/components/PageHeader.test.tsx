import { describe, it, expect } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("should render title", () => {
    const { getByText } = renderWithProviders(<PageHeader title="Users" />);

    expect(getByText("Users")).toBeInTheDocument();
  });

  it("should render subtitle when provided", () => {
    const { getByText } = renderWithProviders(
      <PageHeader title="Users" subtitle="Manage all users in the system" />,
    );

    expect(getByText("Manage all users in the system")).toBeInTheDocument();
  });

  it("should not render subtitle when not provided", () => {
    const { queryByText } = renderWithProviders(<PageHeader title="Users" />);

    expect(queryByText(/Manage all users/)).not.toBeInTheDocument();
  });

  it("should not render breadcrumbs section when breadcrumbs is empty", () => {
    const { container } = renderWithProviders(<PageHeader title="Users" breadcrumbs={[]} />);

    const breadcrumbs = container.querySelector("[class*='MuiBreadcrumbs']");
    expect(breadcrumbs).not.toBeInTheDocument();
  });

  it("should not render breadcrumbs section when breadcrumbs is undefined", () => {
    const { container } = renderWithProviders(<PageHeader title="Users" />);

    const breadcrumbs = container.querySelector("[class*='MuiBreadcrumbs']");
    expect(breadcrumbs).not.toBeInTheDocument();
  });

  it("should render breadcrumb items with href as links", () => {
    const { getByRole } = renderWithProviders(
      <PageHeader
        title="User Details"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Users", href: "/users" },
          { label: "John Doe" },
        ]}
      />,
    );

    const dashboardLink = getByRole("link", { name: /dashboard/i });
    const usersLink = getByRole("link", { name: /users/i });

    expect(dashboardLink).toHaveAttribute("href", "/");
    expect(usersLink).toHaveAttribute("href", "/users");
  });

  it("should render last breadcrumb item as plain text, not a link", () => {
    const { getByText } = renderWithProviders(
      <PageHeader
        title="User Details"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Users", href: "/users" },
          { label: "John Doe" },
        ]}
      />,
    );

    const lastItem = getByText("John Doe");
    // Last item should not be wrapped in a link
    expect(lastItem.closest("a")).not.toBeInTheDocument();
  });

  it("should render breadcrumb without href as plain text", () => {
    const { getByText } = renderWithProviders(
      <PageHeader
        title="User Details"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Users" }, // No href
        ]}
      />,
    );

    const usersItem = getByText("Users");
    // Item without href should not be a link
    expect(usersItem.closest("a")).not.toBeInTheDocument();
  });

  it("should render actions when provided", () => {
    const { getByRole } = renderWithProviders(
      <PageHeader title="Users" actions={<button>Create User</button>} />,
    );

    expect(getByRole("button", { name: /create user/i })).toBeInTheDocument();
  });

  it("should not render actions when not provided", () => {
    const { queryByRole } = renderWithProviders(<PageHeader title="Users" />);

    // Should have no buttons at all when no actions provided
    const buttons = queryByRole("button");
    expect(buttons).not.toBeInTheDocument();
  });

  it("should render all breadcrumbs and title together", () => {
    const { getByText } = renderWithProviders(
      <PageHeader
        title="Edit Profile"
        subtitle="Update your profile information"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Profile", href: "/profile" },
          { label: "Edit" },
        ]}
      />,
    );

    expect(getByText("Home")).toBeInTheDocument();
    expect(getByText("Profile")).toBeInTheDocument();
    expect(getByText("Edit")).toBeInTheDocument();
    expect(getByText("Edit Profile")).toBeInTheDocument();
    expect(getByText("Update your profile information")).toBeInTheDocument();
  });

  it("should support multiple actions", () => {
    const { getByRole } = renderWithProviders(
      <PageHeader
        title="Users"
        actions={
          <div>
            <button>Create</button>
            <button>Export</button>
          </div>
        }
      />,
    );

    expect(getByRole("button", { name: /create/i })).toBeInTheDocument();
    expect(getByRole("button", { name: /export/i })).toBeInTheDocument();
  });

  it("should handle single breadcrumb without rendering links", () => {
    const { getByText, queryByRole } = renderWithProviders(
      <PageHeader
        title="Dashboard"
        breadcrumbs={[
          { label: "Home" }, // Single breadcrumb, no href, is last
        ]}
      />,
    );

    expect(getByText("Home")).toBeInTheDocument();
    // Should not be rendered as a link since it's the last item
    const link = queryByRole("link");
    expect(link).not.toBeInTheDocument();
  });

  it("should render breadcrumbs Breadcrumbs component when breadcrumbs provided", () => {
    const { container } = renderWithProviders(
      <PageHeader title="Dashboard" breadcrumbs={[{ label: "Home", href: "/" }]} />,
    );

    const breadcrumbsComponent = container.querySelector("[class*='MuiBreadcrumbs']");
    expect(breadcrumbsComponent).toBeInTheDocument();
  });

  it("should render intermediate breadcrumb without href as plain text (not a link)", () => {
    const { getByText, getAllByRole } = renderWithProviders(
      <PageHeader
        title="User Details"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Users Archive" }, // Middle breadcrumb without href
          { label: "John Doe" },
        ]}
      />,
    );

    const usersArchiveText = getByText("Users Archive");
    // Should not be wrapped in a link
    expect(usersArchiveText.closest("a")).not.toBeInTheDocument();
    // Should exist as a text element
    expect(usersArchiveText).toBeInTheDocument();

    // Should have exactly 1 link: Dashboard; the others should be text
    const links = getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/");
  });
});
