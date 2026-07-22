import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { forgotPassword } from '../../store/slices/authSlice'
import { FiMail, FiArrowLeft } from 'react-icons/fi';

export default function ForgotPasswordPage() {
  const dispatch = useDispatch()
  const { loading } = useSelector(s => s.auth)

  return (
    <div className="min-h-screen flex items-center justify-center p-6 pt-24 bg-gradient-to-br from-pink-50 to-cream">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <span className="text-5xl">🔐</span>
          <h1 className="font-display text-3xl font-bold text-gray-900 mt-4">Forgot Password?</h1>
          <p className="text-gray-500 mt-2">Enter your email and we'll send a reset link</p>
        </div>
        <Formik
          initialValues={{ email: '' }}
          validationSchema={Yup.object({ email: Yup.string().email('Invalid email').required('Email is required') })}
          onSubmit={(values) => dispatch(forgotPassword(values))}
        >
          {() => (
            <Form className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Field name="email" type="email" placeholder="you@example.com" className="input-field pl-10" />
                </div>
                <ErrorMessage name="email" component="p" className="error-text" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                <FiArrowLeft /> Back to Login
              </Link>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
