"use client"
import { Input } from "@repo/ui/inputBox"
import { useState } from "react"
import { BACKEND_URL } from "../conif"

// function AuthPage({isSignin}: {isSignin: boolean}) {
//   return (
//     <div className='h-screen w-screen flex justify-center items-center '  >

//       <div className=" m-2 bg-white rounded-2xl text-black flex flex-col w-80 shadow-lg p-10 gap-5">

//         <Input
//             label="Email"
//             placeholder="Enter canvas Email"
//             type="email"            
//           />
//           <Input
//             label="Password"
//             placeholder="Enter canvas Email"
//             type="password"
            
//           />
//           { !isSignin &&
//             <Input
//               label="Name"
//               placeholder="Enter your Name"
//               type="text"            
//             />
//           }

//         <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full" onClick={()=>{

//         }}>
//           {isSignin ? 'Sign In' : 'Sign Up'}
//         </button>


//       </div>
//     </div>
//   )
// }

// export default AuthPage



interface AuthPageProps {
  isSignin: boolean
}

function AuthPage({ isSignin }: AuthPageProps) {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const validateForm = (): boolean => {
    if (!email || !password) {
      setError("Email and password are required")
      return false
    }
    
    if (!isSignin && !name) {
      setError("Name is required for sign up")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }

    return true
  }

  const handleSubmit = async (): Promise<void> => {
    setError("")
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      
      const endpoint = isSignin ? `${BACKEND_URL}/signin` : `${BACKEND_URL}/signup`
      const payload = isSignin 
        ? { email, password }
        : { email, password, name }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error messages from backend
        setError(data.message || "An error occurred. Please try again.")
        return
      }

      // For signin, store the token
      if (isSignin && data.token) {
        localStorage.setItem("token", data.token)
      }
      
      // Success
      alert(`${isSignin ? 'Sign in' : 'Sign up'} successful!`)
      
      // Reset form
      setEmail("")
      setPassword("")
      setName("")
      
      // You can redirect here or update app state
      // window.location.href = "/dashboard"
      
    } catch (err) {
      console.error("Auth error:", err)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="m-2 bg-white rounded-2xl text-black flex flex-col w-80 shadow-lg p-10 gap-5">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {isSignin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isSignin ? 'Sign in to continue' : 'Sign up to get started'}
          </p>
        </div>

        <div onKeyPress={handleKeyPress}>
          <Input
            label="Email"
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div onKeyPress={handleKeyPress}>
          <Input
            label="Password"
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {!isSignin && (
          <div onKeyPress={handleKeyPress}>
            <Input
              label="Name"
              placeholder="Enter your name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full font-medium transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Please wait...' : isSignin ? 'Sign In' : 'Sign Up'}
        </button>

        <div className="text-center text-sm text-gray-600">
          {isSignin ? "Don't have an account? " : "Already have an account? "}
          <button 
            className="text-blue-500 hover:underline font-medium"
            onClick={() => window.location.reload()}
          >
            {isSignin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage