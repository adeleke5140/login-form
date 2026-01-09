import { useState } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import './login-form.css'
import { getErrorMessage } from './lib/error-util'
import { mockFetch } from './lib/fetch'

const loginSchema = z.object({
  email: z
    .email('Enter a valid email address')
    .nonempty('Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

const successCopy = {
  heading: 'Signed in successfully',
  errorHeading: 'Unable to sign in',
}

export type LoginFormValues = z.infer<typeof loginSchema>

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setErrorMessage('')
    setStatus('idle')

    try {
      const response = await mockFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.message)
      }

      setStatus('success')
      setErrorMessage(payload.message)
      reset()
    } catch (error: unknown) {
      setStatus('error')
      setErrorMessage(getErrorMessage(error))
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-field">
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          placeholder="you@company.com"
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
          autoComplete="email"
        />
        {errors.email && <p className="field-error">{errors.email.message}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...register('password')}
          aria-invalid={errors.password ? 'true' : 'false'}
          autoComplete="current-password"
        />
        {errors.password && <p className="field-error">{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing you in…' : 'Login'}
      </button>

      {errorMessage && (
        <p
          className={`status-banner ${status === 'error' ? 'error' : 'success'}`}
          role="status"
          aria-live="polite"
        >
          <strong>
            {status === 'error' ? successCopy.errorHeading : successCopy.heading}:
          </strong>{' '}
          {errorMessage}
        </p>
      )}
    </form>
  )
}

export default LoginForm
