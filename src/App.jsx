import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Sidebar from './components/Sidebar/Sidebar'
import Mainn from './components/Main/Mainn'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <>
      <Sidebar />
      <Mainn />
      <SpeedInsights />
      <Analytics />
    </>
  )
}

export default App