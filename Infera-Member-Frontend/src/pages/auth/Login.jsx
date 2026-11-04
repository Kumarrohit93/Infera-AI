// import { useState } from 'react'
// import { motion } from 'framer-motion'
// import BrandLogo from '../../components/common/BrandLogo'
// import LoginForm from '../../components/auth/LoginForm'

// function Login() {
//   const [emailFocused, setEmailFocused] = useState(false)
//   const [passwordFocused, setPasswordFocused] = useState(false)

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-indigo-100 p-3 sm:p-6 lg:flex lg:items-center lg:justify-center lg:p-8">
//       <motion.div
//         initial={{ opacity: 0, y: 25, scale: 0.98 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ duration: 0.7, ease: 'easeOut' }}
//         className="mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-[1400px] flex-col overflow-hidden rounded-[26px] border border-white/80 bg-white shadow-[0_25px_80px_rgba(67,91,125,0.15)] sm:min-h-[calc(100vh-48px)] lg:h-[min(820px,calc(100vh-64px))] lg:min-h-[620px] lg:flex-row"
//       >
        

//         {/* Login section */}
//         <section className="flex w-full items-center justify-center bg-white px-6 py-10 sm:px-12 lg:w-[45%] lg:px-10 xl:px-16">
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.65, delay: 0.2 }}
//             className="w-full max-w-[390px]"
//           >
//             <div className="mb-9 text-center">
//               <div className="mb-5 flex justify-center lg:hidden">
//                 <BrandLogo />
//               </div>

//               <br />

//               <h1 className="text-3xl font-bold tracking-tight text-slate-900">
//                 Welcome Back
//               </h1>

//               <p className="mt-2 text-sm leading-6 text-slate-500">
//                 Enter your email and password to access your account.
//               </p>
//             </div>

//             <LoginForm
//               onEmailFocus={setEmailFocused}
//               onPasswordFocus={setPasswordFocused}
//             />

//             <p className="mt-9 text-center text-[10px] text-slate-400">
//               © 2026 Infera AI. All rights reserved.
//             </p>
//           </motion.div>
//         </section>
//       </motion.div>
//     </main>
//   )
// }

// export default Login





import { useState } from 'react'
import { motion } from 'framer-motion'
import BrandLogo from '../../components/common/BrandLogo'
import LoginForm from '../../components/auth/LoginForm'
import AuthVisual from '../../components/auth/AuthVisual'

function Login() {
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-indigo-100 p-3 sm:p-6 lg:flex lg:items-center lg:justify-center lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-[1400px] flex-col overflow-hidden rounded-[26px] border border-white/80 bg-white shadow-[0_25px_80px_rgba(67,91,125,0.15)] sm:min-h-[calc(100vh-48px)] lg:h-[min(820px,calc(100vh-64px))] lg:min-h-[620px] lg:flex-row"
      >
        {/* Login section */}
        <section className="no-scrollbar flex w-full items-center justify-center bg-white px-6 py-8 sm:px-12 lg:w-[45%] lg:overflow-y-auto lg:px-10 lg:py-6 xl:px-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="w-full max-w-[390px]"
          >
            <div className="mb-6 text-center">
              <div className="mb-5 flex justify-center lg:hidden">
                <BrandLogo />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome Back
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your email and password to access your account.
              </p>
            </div>

            <LoginForm
              onEmailFocus={setEmailFocused}
              onPasswordFocus={setPasswordFocused}
            />

            <p className="mt-6 text-center text-[10px] text-slate-400">
              © 2026 Infera AI. All rights reserved.
            </p>
          </motion.div>
        </section>

        {/* Visual panel (right side) */}
        <AuthVisual />
      </motion.div>
    </main>
  )
}

export default Login