import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import Home from './components/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Misiones from './components/Misiones';
import Tienda from './components/Tienda';
import Personaje from './components/Personaje'
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [username, setUsername] = useState('');
    const [playerInfo, setPlayerInfo] = useState({
        vida: 0,
        energia: 0,
        dinero: 0,
        monedaPremium: 0,
    });
    const [recargaVida, setRecargaVida] = useState(0);
    const [recargaEnergia, setRecargaEnergia] = useState(0);

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
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const vidaInterval = setInterval(async () => {
            if (userInfo && playerInfo.vida < 100) {
                setRecargaVida(prev => prev + 1);
                if (recargaVida >= 1) {
                    const nuevaVida = Math.min(playerInfo.vida + 1, 100);
                    setPlayerInfo(prev => ({ ...prev, vida: nuevaVida }));
    
                    const userDocRef = doc(db, 'Players', userInfo.uid);
                    await updateDoc(userDocRef, {
                        vida: nuevaVida
                    });
                    setRecargaVida(0);
                }
            }
        }, 1000);
    
        return () => clearInterval(vidaInterval);
    }, [playerInfo.vida, recargaVida, userInfo]);
    

    useEffect(() => {
        const energiaInterval = setInterval(async () => {
            if (userInfo && playerInfo.energia < 100) {
                setRecargaEnergia(prev => prev + 1);
                if (recargaEnergia >= 1) {
                    const nuevaEnergia = Math.min(playerInfo.energia + 1, 100);
                    setPlayerInfo(prev => ({ ...prev, energia: nuevaEnergia }));
    
                    const userDocRef = doc(db, 'Players', userInfo.uid);
                    await updateDoc(userDocRef, {
                        energia: nuevaEnergia
                    });
    
                    setRecargaEnergia(0);
                }
            }
        }, 1000);
    
        return () => clearInterval(energiaInterval);
    }, [playerInfo.energia, recargaEnergia, userInfo]);
    

    return (
        <Router>
            <Header isAuthenticated={isAuthenticated} playerInfo={playerInfo} />
            {isAuthenticated && <Footer />}
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
