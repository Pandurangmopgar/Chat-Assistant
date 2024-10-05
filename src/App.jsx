import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar/Sidebar'
import Mainn from './components/Main/Mainn'
import AdminDocumentUpload from './components/DocumentUpload/upload'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <Sidebar />
            <Mainn />
          </>
        } />
        <Route path="/admin/upload-document" element={<AdminDocumentUpload />} />
      </Routes>
      <SpeedInsights />
      <Analytics />
    </Router>
  )
}

export default App