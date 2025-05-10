import React from 'react'
import MatrizCarros from './Components/MatrizCarros'
import './App.css'
import TrackingMap from './Components/TrackingMap'
import TrackingThree from './View/TrackingThree'
import { ApiProvider } from './context/ApiContext'

const App = () => {
  return (
    <>
      <ApiProvider>
        <TrackingThree />
      </ApiProvider>
    </>
  )
}

export default App
