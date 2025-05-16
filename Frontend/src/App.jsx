
import { ApiProvider } from './context/ApiContext'
import { NavegationRoute } from './routes/NavegationRoute'

const App = () => {
  return (
    <>
      <ApiProvider>
        <NavegationRoute />
      </ApiProvider>
    </>
  )
}

export default App
