import React, { useContext } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar/Sidebar'
import Mainn from './components/Main/Mainn'
import AdminDocumentUpload from './components/DocumentUpload/upload'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from "@vercel/analytics/react"
import { Context } from './context/Context'
import AdminDashboard from './components/Admin/AdminDashboard'
import AdminManageUsers from './components/Admin/AdminManageUsers'
import UserAnalytics from './components/Admin/UserAnalytics'
import { Toaster } from "@/components/ui/toaster" // Import Toaster

function App() {
  const { darkMode } = useContext(Context);
  
  return (
    <Router>
      <div className={`flex h-screen w-full overflow-hidden ${darkMode ? 'dark' : ''}`}>
        <Routes>
          <Route path="/" element={
            <>
              <Sidebar />
              <main className="flex-1 overflow-y-auto bg-background text-foreground">
                <Mainn />
              </main>
            </>
          } />
          <Route path="/admin" element={
            <main className="flex-1 overflow-y-auto bg-background text-foreground">
              <AdminDashboard />
            </main>
          } />
           <Route path="/admin/user-analytics" element={
            <main className="flex-1 overflow-y-auto bg-background text-foreground">
              <UserAnalytics />
            </main>
          } />
          <Route path="/admin/upload-document" element={
            <main className="flex-1 overflow-y-auto bg-background text-foreground">
              <AdminDocumentUpload />
            </main>
          } />
          <Route path="/admin/manage-users" element={
            <main className="flex-1 overflow-y-auto bg-background text-foreground">
              <AdminManageUsers />
            </main>
          } />
        </Routes>
      </div>
      <Toaster /> {/* Add Toaster component */}
      <SpeedInsights />
      <Analytics />
    </Router>
  )
}

export default App