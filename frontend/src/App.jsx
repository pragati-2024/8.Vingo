import React from 'react'
import { useEffect } from 'react'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
export const serverUrl = "http://localhost:8000"
function App() {

   return (
        <Layout>
            <Routes>
                <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to="/" />} />
                <Route path='/signin' element={!userData ? <SignIn /> : <Navigate to="/" />} />
                <Route path='/forgot-password' element={!userData ? <ForgotPassword /> : <Navigate to="/" />} />
                 </Routes>
        </Layout>
    )
}

export default App
