import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import MissionCard from "./MissionCard";
import './css/Misiones.css';
import RoboPersona from '../assets/robo-a-persona.jpg';
import RoboACasa from '../assets/robo-a-casa.jpg';
import AsaltoAlBanco from '../assets/robo-a-banco.jpg';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function Misiones() {
    const [missionInProgress, setMissionInProgress] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [playerInfo, setPlayerInfo] = useState({
        uid: 'user-id',
        energia: 100,
        dinero: 0
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const fetchPlayerData = async () => {
                    try {
                        const docRef = doc(db, 'Players', user.uid);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            setPlayerInfo(docSnap.data());
                        } else {
                            console.log("No such document!");
                        }
                    } catch (error) {
                        console.error("Error fetching player data:", error);
                    }
                };
    
                fetchPlayerData();
            } else {
                console.log("User is not authenticated");
            }
        });
    
        return () => unsubscribe();
    }, []);
    

    const handleStartMision = () => {
        console.log('Mision comenzada desde Mision.jsx')
        setMissionInProgress(true);
    };

    const handleEndMision = (message) => {
        console.log('Mision finalizada con mensaje', message)
        setMissionInProgress(false);
        setPopupMessage(message);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setPopupMessage("");
    };

    const missions = [
        {
            id: 1,
            title: "Robar a una Persona",
            imageSrc: RoboPersona,
            description: "Roba a una persona en la calle",
            moneyReward: "$50 - $250",
            xpReward: "5 - 25",
            difficulty: 15,
            duration: 1.5 * 60,
            costEnergy: 10,
        },
        {
            id: 2,
            title: "Robar una Casa",
            imageSrc: RoboACasa,
            description: "Irrumpe dentro de una casa y apropiate objetos de valor",
            moneyReward: "$1500 - $2500",
            xpReward: "150 - 250",
            difficulty: 35,
            duration: 15 * 60,
            costEnergy: 35,
        },
        {
            id: 3,
            title: "Atraco al Banco",
            imageSrc: AsaltoAlBanco,
            description: "Entra al Banco y roba la bodega de Oro",
            moneyReward: "$30000 - $50000",
            xpReward: "750 - 1000",
            difficulty: 85,
            duration: 4 * 3600,
            costEnergy: 60,
        },
    ];

    return (
        <div className="PrincipalContainer Misiones">
            <h1>Misiones</h1>

            {playerInfo ? (
                missions.map((mission) => (
                    <MissionCard
                        key={mission.id}
                        title={mission.title}
                        imageSrc={mission.imageSrc}
                        description={mission.description}
                        moneyReward={mission.moneyReward}
                        xpReward={mission.xpReward}
                        difficulty={mission.difficulty}
                        duration={mission.duration}
                        missionInProgres={missionInProgress}
                        onStartMission={handleStartMision}
                        onEndMission={(message) => handleEndMision(message)}
                        energiaCost={mission.costEnergy}
                        playerInfo={playerInfo}
                        setPlayerInfo={setPlayerInfo}
                    />
                ))
            ) : (
                <p>Cargando información del jugador...</p>
            )}

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Misión Completada</h2>
                        <p>{popupMessage}</p>
                        <button onClick={closePopup}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
}
