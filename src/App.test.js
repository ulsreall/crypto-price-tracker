import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

test("renders the crypto price tracker dashboard", async () => {
  render(<App />);

  expect(screen.getByRole("heading", { name: /crypto price tracker/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /explore market/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /market overview/i })).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText(/no coin found/i)).toBeInTheDocument();
  });
});
