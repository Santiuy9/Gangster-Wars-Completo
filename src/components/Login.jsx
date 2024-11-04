import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth';
import './css/login.css'

export default function Login() {
    // const [username, setUsername] = useState('')
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('Inicio de sesion exitoso');
            navigate('/');

        }
        catch (error) {
            setError('Error al iniciar sesion' + error.message);
        }
    };

    return (
        <div className='PrincipalContainer login-container'>
            <div className="login-form">
                <h3 className='form-title'>Iniciar Sesion</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="text"
                            id='email'
                            placeholder='Email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contrasena</label>
                        <input 
                            type="password"
                            id='password'
                            placeholder='Contrasena'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                        {error && <p className='error-message'>{error}</p>}
                    <div className='form-actions'>
                        <button type='submit' className='login-button'>
                            <span>Iniciar Sesion</span>
                        </button>
                        <Link to='/register' className='register-link'>
                            No tienes una cuenta? Registrate
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

