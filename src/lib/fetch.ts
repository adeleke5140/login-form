import type { LoginFormValues } from "../login-form";

const mockDelay = 1000;

interface MockResponse<T> {
  ok: boolean;
  status: number;
  json: () => Promise<T>;
}

type MockLoginResponse = {
  message: string;
};

export const mockFetch = async (
  _url: string,
  options?: RequestInit
): Promise<MockResponse<MockLoginResponse>> => {
  const rawBody = typeof options?.body === "string" ? options.body : "{}";
  let body: LoginFormValues = { email: "", password: "" };

  try {
    body = JSON.parse(rawBody) as LoginFormValues;
  } catch (error) {
    console.warn("Unable to parse request body for mock fetch:", error);
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const shouldFail = body.email.endsWith("@invalid.test");

      if (shouldFail) {
        resolve({
          ok: false,
          status: 401,
          json: async () => ({
            message: "We could not find an account with those credentials.",
          }),
        });
        return;
      }

      resolve({
        ok: true,
        status: 200,
        json: async () => ({
          message: `Welcome back to the Martian Verse, ${body.email}`,
        }),
      });
    }, mockDelay);
  });
};
