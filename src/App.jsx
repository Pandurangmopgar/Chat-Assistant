import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Sidebar from './components/Sidebar/Sidebar'
import Mainn from './components/Main/Mainn'
// import Main from './components/Main/Main'
// import './components/Sidebar.css'

function App() {
  // const [count, setCount] = useState(0)

  return (

 <>
 <Sidebar/>
 <Mainn/>
 </>
 )
}

export default App
