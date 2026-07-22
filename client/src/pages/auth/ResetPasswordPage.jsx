import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { resetPassword } from '../../store/slices/authSlice'
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function ResetPasswordPage() {
  const { token } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector(s => s.auth)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (values) => {
    const result = await dispatch(resetPassword({ token, password: values.password }))
    if (!result.error) navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 pt-24 bg-gradient-to-br from-pink-50 to-cream">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <span className="text-5xl">🔑</span>
          <h1 className="font-display text-3xl font-bold text-gray-900 mt-4">Set New Password</h1>
          <p className="text-gray-500 mt-2">Enter your new password below</p>
        </div>
        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={Yup.object({
            password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
            confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Confirm password'),
          })}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="space-y-5">
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Field name="password" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" className="input-field pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <ErrorMessage name="password" component="p" className="error-text" />
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Field name="confirmPassword" type="password" placeholder="••••••••" className="input-field pl-10" />
                </div>
                <ErrorMessage name="confirmPassword" component="p" className="error-text" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
