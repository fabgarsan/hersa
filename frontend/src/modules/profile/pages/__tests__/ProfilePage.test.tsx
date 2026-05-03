import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/tests/utils";
import ProfilePage from "../ProfilePage";

// Mock the query hook
vi.mock("@modules/auth", () => ({
  useMeQuery: vi.fn(),
}));

// Mock the ChangePasswordForm component
vi.mock("../../features/password", () => ({
  ChangePasswordForm: () => <div data-testid="change-password-form">Change Password Form</div>,
}));

import { useMeQuery } from "@modules/auth";

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state", () => {
    it("should render skeleton loaders while data is loading", () => {
      vi.mocked(useMeQuery).mockReturnValue({
        data: undefined,
        isLoading: true,
        isPending: true,
        status: "pending",
      } as any);

      renderWithProviders(<ProfilePage />);

      // data-testid added to the skeleton list in ProfilePage
      expect(screen.getByTestId("profile-skeleton-list")).toBeInTheDocument();
    });

    it("should render page title while loading", () => {
      vi.mocked(useMeQuery).mockReturnValue({
        data: undefined,
        isLoading: true,
        isPending: true,
        status: "pending",
      } as any);

      renderWithProviders(<ProfilePage />);

      expect(screen.getByText("Mi perfil")).toBeInTheDocument();
    });
  });

  describe("render with user data", () => {
    const mockUser = {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
    };

    it("should render user information when data is loaded", () => {
      vi.mocked(useMeQuery).mockReturnValue({
        data: mockUser,
        isLoading: false,
        isPending: false,
        status: "success",
      } as any);

      renderWithProviders(<ProfilePage />);

      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("Doe")).toBeInTheDocument();
      expect(screen.getByText("testuser")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    it("should display field labels", () => {
      vi.mocked(useMeQuery).mockReturnValue({
        data: mockUser,
        isLoading: false,
        isPending: false,
        status: "success",
      } as any);

      renderWithProviders(<ProfilePage />);

      expect(screen.getByText("Nombre")).toBeInTheDocument();
      expect(screen.getByText("Apellido")).toBeInTheDocument();
      expect(screen.getByText("Usuario")).toBeInTheDocument();
      expect(screen.getByText("Correo")).toBeInTheDocument();
    });

    it("should render page title", () => {
      vi.mocked(useMeQuery).mockReturnValue({
        data: mockUser,
        isLoading: false,
        isPending: false,
        status: "success",
      } as any);

      renderWithProviders(<ProfilePage />);

      expect(screen.getByText("Mi perfil")).toBeInTheDocument();
    });

    it("should render ChangePasswordForm component", () => {
      vi.mocked(useMeQuery).mockReturnValue({
        data: mockUser,
        isLoading: false,
        isPending: false,
        status: "success",
      } as any);

      renderWithProviders(<ProfilePage />);

      expect(screen.getByTestId("change-password-form")).toBeInTheDocument();
    });

    it("should render both info and change password sections", () => {
      vi.mocked(useMeQuery).mockReturnValue({
        data: mockUser,
        isLoading: false,
        isPending: false,
        status: "success",
      } as any);

      renderWithProviders(<ProfilePage />);

      expect(screen.getByText("Mi información")).toBeInTheDocument();
      expect(screen.getByText("Cambiar contraseña")).toBeInTheDocument();
    });
  });

  describe("render with missing user data fields", () => {
    it("should display em dash (—) for missing firstName", () => {
      const userWithoutFirstName = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        firstName: "",
        lastName: "Doe",
      };

      vi.mocked(useMeQuery).mockReturnValue({
        data: userWithoutFirstName,
        isLoading: false,
        isPending: false,
        status: "success",
      } as any);

      renderWithProviders(<ProfilePage />);

      const nameRows = screen.getAllByText("—");
      expect(nameRows.length).toBeGreaterThan(0);
    });

    it("should display em dash (—) for missing lastName", () => {
      const userWithoutLastName = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        firstName: "John",
        lastName: "",
      };

      vi.mocked(useMeQuery).mockReturnValue({
        data: userWithoutLastName,
        isLoading: false,
        isPending: false,
        status: "success",
      } as any);

      renderWithProviders(<ProfilePage />);

      const emDashes = screen.getAllByText("—");
      expect(emDashes.length).toBeGreaterThan(0);
    });

    it("should display em dash (—) for missing username", () => {
      const userWithoutUsername = {
        id: 1,
        username: "",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
      };

      vi.mocked(useMeQuery).mockReturnValue({
        data: userWithoutUsername,
        isLoading: false,
        isPending: false,
        status: "success",
      } as any);

      renderWithProviders(<ProfilePage />);

      const emDashes = screen.getAllByText("—");
      expect(emDashes.length).toBeGreaterThan(0);
    });

    it("should display em dash (—) for missing email", () => {
      const userWithoutEmail = {
        id: 1,
        username: "testuser",
        email: "",
        firstName: "John",
        lastName: "Doe",
      };

      vi.mocked(useMeQuery).mockReturnValue({
        data: userWithoutEmail,
        isLoading: false,
        isPending: false,
        status: "success",
      } as any);

      renderWithProviders(<ProfilePage />);

      const emDashes = screen.getAllByText("—");
      expect(emDashes.length).toBeGreaterThan(0);
    });

    it("should display em dash for all fields when user object is empty", () => {
      const emptyUser = {
        id: 1,
        username: "",
        email: "",
        firstName: "",
        lastName: "",
      };

      vi.mocked(useMeQuery).mockReturnValue({
        data: emptyUser,
        isLoading: false,
        isPending: false,
        status: "success",
      } as any);

      renderWithProviders(<ProfilePage />);

      const emDashes = screen.getAllByText("—");
      // Should have em dashes for all 4 fields
      expect(emDashes.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("card structure", () => {
    const mockUser = {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
    };

    it("should render cards with person and lock icons", () => {
      vi.mocked(useMeQuery).mockReturnValue({
        data: mockUser,
        isLoading: false,
        isPending: false,
        status: "success",
      } as any);

      const { container } = renderWithProviders(<ProfilePage />);

      // MUI icons are SVG elements
      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBeGreaterThan(0);
    });

    it("should render two grid columns for mobile and desktop layout", () => {
      vi.mocked(useMeQuery).mockReturnValue({
        data: mockUser,
        isLoading: false,
        isPending: false,
        status: "success",
      } as any);

      const { container } = renderWithProviders(<ProfilePage />);

      // Grid2 with size={{ xs: 12, md: 6 }}
      const gridItems = container.querySelectorAll(".MuiGrid2-root");
      expect(gridItems.length).toBeGreaterThan(0);
    });
  });

  describe("responsive layout", () => {
    const mockUser = {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
    };

    it("should have both sections visible in single or split layout", () => {
      vi.mocked(useMeQuery).mockReturnValue({
        data: mockUser,
        isLoading: false,
        isPending: false,
        status: "success",
      } as any);

      renderWithProviders(<ProfilePage />);

      expect(screen.getByText("Cambiar contraseña")).toBeInTheDocument();
      expect(screen.getByText("Mi información")).toBeInTheDocument();
    });
  });
});
