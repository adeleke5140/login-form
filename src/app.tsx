import LoginForm from './login-form'
import './index.css'

function App() {
  return (
    <main className='app'>
        <div className='app-header'>
            <img src="/martians.svg" alt="Martians Logo" width={80} height={80} />
            <h1>Log in to Martian Verse</h1>
        </div>
      <LoginForm />
    </main>
  )
}

export default App
