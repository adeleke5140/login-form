import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import "./login-form.css";
import { getErrorMessage } from "./lib/error-util";
import { mockFetch } from "./lib/fetch";

const loginSchema = z.object({
  email: z.email("Enter a valid email address").nonempty("Email is required"),
  password: z.string().nonempty("Password should not be empty"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isSubmitting = status === "loading";
  const passwordFieldType = isPasswordVisible ? "text" : "password";
  const passwordToggleLabel = isPasswordVisible
    ? "Hide password"
    : "Show password";
  const passwordToggleIcon = isPasswordVisible
    ? "/eye-open.svg"
    : "/eye-closed.svg";

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    if(status === 'loading'){
      console.log("submission in progress")
      return 
    }
    setErrorMessage("");
    setStatus("loading");
    setResponse("");

    try {
      const response = await mockFetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message);
      }

      setStatus("success");
      setResponse(payload.message);
      reset();
    } catch (error: unknown) {
      setStatus("error");
      setErrorMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-field">
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          placeholder="you@company.com"
          {...register("email")}
          aria-invalid={errors.email ? "true" : "false"}
          autoComplete="email"
          autoCapitalize="false"
          aria-required="true"
          aria-describedby="email-error"
        />
        {errors.email && (
          <p id="email-error" className="field-error">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <div className="password-input">
          <input
            id="password"
            type={passwordFieldType}
            placeholder="Enter your password"
            {...register("password")}
            aria-invalid={errors.password ? "true" : "false"}
            autoComplete="current-password"
            autoCapitalize="false"
            aria-required="true"
            aria-describedby="password-error"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            aria-label={passwordToggleLabel}
            aria-pressed={isPasswordVisible}
            aria-controls="password"
            title={passwordToggleLabel}
          >
            <img src={passwordToggleIcon} alt="" aria-hidden="true" />
            <span className="sr-only">{passwordToggleLabel}</span>
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="field-error">
            {errors.password.message}
          </p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}> 
        {isSubmitting ? "Signing you in…" : "Login"}
      </button>

      <p
        role="status"
        aria-live="polite"
        className={`status-banner ${errorMessage ? "error" : ""}`}
      >
        {errorMessage ? (
          <>
            <strong>Unable to Sign in:</strong> {errorMessage}
          </>
        ) : null}
      </p>

      <p
        role="status"
        aria-live="polite"
        className={`status-banner ${response ? "success" : ""}`}
      >
        {response ? (
          <>
            <strong>Signed in successful: </strong>
            {response}
          </>
        ) : null}
      </p>
    </form>
  );
};

export default LoginForm;
