import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './css/Header.css';
           
export default function Header({ playerInfo, isAuthenticated }) {
    const navigate = useNavigate()
    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log('Sesion cerrada correctamente');
            navigate('/')
        }
        catch (error) {
            console.log('Error al cerrar sesion', error);
        }
    }
    
    return (
        <header className="game-header">
        {isAuthenticated ? (
            <>
            <div className="player-stat">
                <span className="stat-label">Vida:</span>
                <div className="stat-bar">
                    <div className="stat-fill health-fill" style={{width: `${playerInfo.vida}%`}}></div>
                </div>
                <span className="stat-value">{playerInfo.vida}</span>
            </div>
            <div className="player-stat">
                <span className="stat-label">Energía:</span>
                <div className="stat-bar">
                    <div className="stat-fill energy-fill" style={{width: `${playerInfo.energia}%`}}></div>
                </div>
                <span className="stat-value">{playerInfo.energia}</span>
            </div>
            <div className="player-stat">
                <span className="stat-label">Dinero:</span>
                <span className="stat-value">${playerInfo.dinero}</span>
            </div>
            <div className="player-stat">
                <span className="stat-label">Moneda Premium:</span>
                <span className="stat-value">{playerInfo.monedaPremium}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
                Cerrar Sesión
            </button>
            </>
        ) : (
            <div className="guest-header">
            <h1>Bienvenido a <Link to="/">Gangster Wars</Link></h1>
            <p>
                <Link to="/login">Inicia Sesion</Link> o <Link to="/register">Registrate</Link> para comenzar
            </p>
            </div>
        )}
        </header>
    );
}