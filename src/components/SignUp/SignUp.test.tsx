import React from "react";
import { render, screen, waitFor, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { rest } from "msw";
import SignUp from "./SignUp";
import { handlers } from "./handlers";

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("SignUp Component", () => {
  describe("Validation", () => {
    it("should display validation errors for invalid email", async () => {
      render(<SignUp />);
      const emailField = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });
      await userEvent.type(emailField, "invalid");
      await userEvent.click(submitButton);
      expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
    });

    it("should display validation errors for short password", async () => {
      render(<SignUp />);
      const passwordField = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });
      await userEvent.type(passwordField, "1111");
      await userEvent.click(submitButton);
      expect(
        await screen.findByText(/password should be of minimum 8 characters length/i)
      ).toBeInTheDocument();
    });

    it("should display success message on successful sign-up", async () => {
      render(<SignUp />);
      await userEvent.type(screen.getByLabelText(/user name/i), "validuser");
      await userEvent.type(screen.getByLabelText(/email address/i), "valid@gmail.com");
      await userEvent.type(screen.getByLabelText(/password/i), "1234567890");

      const button = screen.getByRole("button", { name: /sign up/i });

      await act(async () => {
        await userEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByText("Sign Up Successfully!")).toBeInTheDocument();
      });
    });

    it("should display error message on sign-up failure", async () => {
      server.use(
        rest.post("https://api.realworld.io/api/users", (req, res, ctx) => {
          return res(ctx.status(500));
        })
      );

      render(<SignUp />);
      await userEvent.type(screen.getByLabelText(/user name/i), "failuser");
      await userEvent.type(screen.getByLabelText(/email address/i), "fail@gmail.com");
      await userEvent.type(screen.getByLabelText(/password/i), "1234567890");

      const button = screen.getByRole("button", { name: /sign up/i });

      await act(async () => {
        await userEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByText(/error signing up!/i)).toBeInTheDocument();
      });
    });
  });

  describe("Form Interaction", () => {
    it("should enable Sign Up button when form is valid", async () => {
      render(<SignUp />);
      const username = screen.getByLabelText(/user name/i);
      const email = screen.getByLabelText(/email address/i);
      const password = screen.getByLabelText(/password/i);
      const button = screen.getByRole("button", { name: /sign up/i });

      expect(button).toBeDisabled();

      await userEvent.type(username, "valid");
      await userEvent.type(email, "valid@gmail.com");
      await userEvent.type(password, "12345678900");

      await waitFor(() => expect(button).toBeEnabled());
    });

    it("should disable Sign Up button when form is invalid", async () => {
      render(<SignUp />);
      const button = screen.getByRole("button", { name: /sign up/i });

      expect(button).toBeDisabled();

      await userEvent.type(screen.getByLabelText(/user name/i), "test");

      await waitFor(() => expect(button).toBeDisabled());
    });

    it("should update form fields on user input", async () => {
      render(<SignUp />);
      const username = screen.getByLabelText(/user name/i);
      const email = screen.getByLabelText(/email address/i);
      const password = screen.getByLabelText(/password/i);

      await userEvent.type(username, "sali_osama");
      await userEvent.type(email, "sali@gmail.com");
      await userEvent.type(password, "12345678900");

      expect(username).toHaveValue("sali_osama");
      expect(email).toHaveValue("sali@gmail.com");
      expect(password).toHaveValue("12345678900");
    });

    it("should redirect user to home page after successful signup", async () => {
      render(<SignUp />);
      await userEvent.type(screen.getByLabelText(/user name/i), "new_user");
      await userEvent.type(screen.getByLabelText(/email address/i), "newuser@gmail.com");
      await userEvent.type(screen.getByLabelText(/password/i), "123456789");

      const button = screen.getByRole("button", { name: /sign up/i });

      await act(async () => {
        await userEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByText(/Our latest/i)).toBeInTheDocument();
      });
    });

    it("should show loading state during submission", async () => {
      // Mock the API to delay the response so loading state has time to appear
      server.use(
        rest.post("https://api.realworld.io/api/users", async (req, res, ctx) => {
          await new Promise(resolve => setTimeout(resolve, 1000)); 
          return res(
            ctx.json({
              user: {
                username: "loading_user",
                email: "loadinguser@gmail.com",
              },
            })
          );
        })
      );
    
      render(<SignUp />);
      await userEvent.type(screen.getByLabelText(/user name/i), "load_user");
      await userEvent.type(screen.getByLabelText(/email address/i), "loaduser@gmail.com");
      await userEvent.type(screen.getByLabelText(/password/i), "123456789");
    
      const button = screen.getByRole("button", { name: /sign up/i });
    
      await act(async () => {
        await userEvent.click(button);
      });
          const progress = await within(button).findByRole("progressbar");
      expect(progress).toBeInTheDocument();
    });
  });
});