import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth, db } from '../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import './css/Register.css'

export default function Register() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
      
        if (!username || !email || !password || !confirmPassword) {
          setError('Por favor, completa todos los campos.')
          return
        }
      
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden.')
          return
        }
      
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password)
          const user = userCredential.user
          
          if (user) {
            await setDoc(doc(db, 'Players', user.uid), {
              uid: user.uid,
              username: username,
              email: email,
              vida: 100,
              energia: 100,
              dinero: 0,
              monedaPremium: 0,
              Character: {
                Armamento: [],
                Equipamiento: [],
                Vehículo: []
              },
              Inventory: []
            })
            console.log('Usuario registrado y guardado en Firestore')
            navigate('/')
          } else {
            setError('Error en la autenticación')
          }
        } catch (error) {
          setError(error.message)
          console.error('Error al crear el usuario:', error)
        }
    }

    return (
        <div className="PrincipalContainer register-container">
          <div className="register-form">
            <h3 className="form-title">Crea tu cuenta</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Nombre de usuario</label>
                <input
                  type="text"
                  id="username"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirmar Contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="form-actions">
                <button type="submit" className="register-button">
                  <span>Registrarse</span>
                </button>
                <Link to="/login" className="login-link">
                  ¿Ya tienes una cuenta? Inicia sesión
                </Link>
              </div>
            </form>
          </div>
        </div>
    )
}