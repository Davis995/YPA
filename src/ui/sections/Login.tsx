import { useForm } from "react-hook-form";
import   {ChefHat} from "lucide-react"
import { m } from 'framer-motion';
import { useState } from "react";
export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<{ accessCode: string }>();
    const onsubmit = (data:any)=>{
        console.log(data)
    }
     const [loading, setLoading] = useState(false)
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center p-4">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <ChefHat className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Login</h1>
          <p className="text-gray-600">Enter your access code to continue</p>
        </div>

        <form onSubmit={handleSubmit(onsubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Code
            </label>
            <m.input
              whileFocus={{ scale: 1.02 }}
              type="password"
              {...register('accessCode', { required: 'Access code is required' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter access code"
            />
            {errors.accessCode && (
              <p className="text-red-500 text-sm mt-1">{errors.accessCode.message}</p>
            )}
          </div>

          <m.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </m.button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Demo code: <code className="bg-gray-100 px-2 py-1 rounded">admin123</code>
        </div>
      </m.div>
    </div>
  );
};