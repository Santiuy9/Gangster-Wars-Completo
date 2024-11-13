import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import Home from './components/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Misiones from './components/Misiones';
import Tienda from './components/Tienda';
import Personaje from './components/Personaje';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [username, setUsername] = useState('');
    const [playerInfo, setPlayerInfo] = useState(null);
    const recargaInterval = 5000; // 5 minutos en milisegundos
    const [tiempoRestanteVida, setTiempoRestanteVida] = useState(0);
    const [tiempoRestanteEnergia, setTiempoRestanteEnergia] = useState(0);

    const formatTime = (seconds) => {
        // console.log(seconds / 1000)
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                setUserInfo(user);

                const userDocRef = doc(db, 'Players', user.uid);
                const unsubscribeFirestore = onSnapshot(userDocRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.data();
                        setUsername(userData.username);
                        setPlayerInfo(userData);
                    } else {
                        console.log("No hay datos del usuario");
                    }
                });

                return () => unsubscribeFirestore();
            } else {
                setIsAuthenticated(false);
                setUserInfo(null);
                setUsername('');
                setPlayerInfo(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const actualizarRecarga = async (userData) => {
        const now = Date.now();
    
        // Vida
        if (userData.vida < 100 && userData.lastVidaUpdate) {
            const tiempoTranscurridoVida = now - userData.lastVidaUpdate.toMillis();
            const puntosRecargaVida = Math.floor(tiempoTranscurridoVida / recargaInterval);
            const nuevaVida = Math.min(userData.vida + puntosRecargaVida, 100);
            setTiempoRestanteVida(recargaInterval - (tiempoTranscurridoVida % recargaInterval) / 1000); // En segundos
    
            if (nuevaVida !== userData.vida) {
                await actualizarAtributo('vida', nuevaVida);
            }
        } else if (userData.vida === 100) {
            // Si la vida llega a 100, invalidamos el lastVidaUpdate
            await actualizarAtributo('lastVidaUpdate', null);
        }
    
        // Energía
        if (userData.energia < 100 && userData.lastEnergiaUpdate) {
            const tiempoTranscurridoEnergia = now - userData.lastEnergiaUpdate.toMillis();
            const puntosRecargaEnergia = Math.floor(tiempoTranscurridoEnergia / recargaInterval);
            const nuevaEnergia = Math.min(userData.energia + puntosRecargaEnergia, 100);
            setTiempoRestanteEnergia(recargaInterval - (tiempoTranscurridoEnergia % recargaInterval) / 1000); // En segundos
    
            if (nuevaEnergia !== userData.energia) {
                await actualizarAtributo('energia', nuevaEnergia);
            }
        } else if (userData.energia === 100) {
            // Si la energía llega a 100, invalidamos el lastEnergiaUpdate
            await actualizarAtributo('lastEnergiaUpdate', null);
        }
    };
    

    const actualizarAtributo = async (atributo, valor) => {
        if (!userInfo) return;
        const userDocRef = doc(db, 'Players', userInfo.uid);
    
        // Si estamos invalidando el last update, lo establecemos como null
        const updateData = atributo === 'lastVidaUpdate' || atributo === 'lastEnergiaUpdate' 
            ? { [atributo]: null } 
            : { [atributo]: valor, [`last${atributo.charAt(0).toUpperCase() + atributo.slice(1)}Update`]: new Date() };
    
        await updateDoc(userDocRef, updateData);
    
        setPlayerInfo((prev) => ({
            ...prev, 
            [atributo]: valor 
        }));
    };

    useEffect(() => {
        if (playerInfo) {
            actualizarRecarga(playerInfo); // Llama a actualizarRecarga cada vez que playerInfo cambia
        }
    }, [playerInfo]);

    useEffect(() => {
        if (!playerInfo) return;
    
        const interval = setInterval(() => {
            if (userInfo) {
                // Si la vida o la energía están al 100, no se recarga nada
                if (playerInfo.vida >= 100 && playerInfo.energia >= 100) {
                    clearInterval(interval); // Detenemos la recarga si ambos están a 100
                } else {
                    if (playerInfo.vida < 100) {
                        actualizarAtributo('vida', playerInfo.vida + 1);
                    }
                    if (playerInfo.energia < 100) {
                        actualizarAtributo('energia', playerInfo.energia + 1);
                    }
                }
            }
        }, recargaInterval);
    
        return () => clearInterval(interval); // Limpiar el intervalo cuando el componente se desmonte
    }, [playerInfo, userInfo]);

    // Cuenta regresiva visual para recargas
    useEffect(() => {
        const countdownInterval = setInterval(() => {
            setTiempoRestanteVida((prev) => (prev > 0 ? prev - 1 : recargaInterval / 1000));
            // console.log(tiempoRestanteVida)
            setTiempoRestanteEnergia((prev) => (prev > 0 ? prev - 1 : recargaInterval / 1000));
            console.log(tiempoRestanteEnergia)
        }, 1000); // Cada segundo

        return () => clearInterval(countdownInterval);
    }, []);

    return (
        <Router>
            <Header 
                isAuthenticated={isAuthenticated} 
                playerInfo={playerInfo || { vida: 0, energia: 0, dinero: 0, monedaPremium: 0 }} 
                tiempoRestanteVida={formatTime(tiempoRestanteVida)} 
                tiempoRestanteEnergia={formatTime(tiempoRestanteEnergia)} 
            />
            {isAuthenticated && <Footer />}
            <div className="recarga-contador">
                <p>Recarga de vida en: {Math.ceil(tiempoRestanteVida)} segundos</p>
                <p>Recarga de energía en: {Math.ceil(tiempoRestanteEnergia)} segundos</p>
            </div>
            <Routes>
                <Route path="/" element={<Home username={username} />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/misiones" element={<Misiones />} />
                <Route path="/tienda" element={<Tienda />} />
                <Route path="/personaje" element={<Personaje />} />
            </Routes>
        </Router>
    );
}

export default App;
