import { rest } from "msw";

export const handlers = [
  rest.post("https://api.realworld.io/api/users", async (req, res, ctx) => {
    return res(
      ctx.json({
        user: {
          username: "testuser",
          email: "test@gmail.com",
        },
      })
    );
  }),
];