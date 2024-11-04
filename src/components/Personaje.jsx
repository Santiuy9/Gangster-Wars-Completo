import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import './css/Personaje.css';

export default function Personaje() {
    const [character, setCharacter] = useState({
        Armamento: [],
        Equipamiento: [],
        Vehículo: []
    });
    const [inventory, setInventory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchPlayerData(currentUser.uid);
            } else {
                console.log("No user is authenticated");
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchPlayerData = async (userId) => {
        const playerRef = doc(db, 'Players', userId);
        const playerDoc = await getDoc(playerRef);
        if (playerDoc.exists()) {
            const playerData = playerDoc.data();
            setCharacter(playerData.Character || {});
            setInventory(playerData.Inventory || []);
        }
        setIsLoading(false);
    };

    const handleEquipItem = async (item, category) => {
        if (user) {
            const newCharacter = { ...character, [category]: item };
            setCharacter(newCharacter);

            const playerRef = doc(db, 'Players', user.uid);
            await updateDoc(playerRef, {
                Character: newCharacter
            });
        } else {
            console.log("No user is authenticated");
        }
    };

    const unequipItem = async (category) => {
        if (user) {
            const item = character[category];
            if (item) {
                const newCharacter = { ...character, [category]: null };
                setCharacter(newCharacter);

                const playerRef = doc(db, 'Players', user.uid);
                await updateDoc(playerRef, {
                    Character: newCharacter
                });
            }
        } else {
            console.log("No user is authenticated");
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="PrincipalContainer Personaje">
            <h1>Personaje</h1>
            <div className="Personaje-container">
                <div className="Character">
                    <h2>Personaje</h2>
                    <div className="character-slots">
                        {["Armamento", "Equipamiento", "Vehículo"].map((category, index) => (
                            <div className="slot" key={index}>
                                {character[category] ? (
                                    <>
                                        <p>{character[category].title}</p>
                                        <button onClick={() => unequipItem(category)}>Desequipar</button>
                                    </>
                                ) : (
                                    <p>Vacío</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="Inventory">
                    <h2>Inventario</h2>
                    <div className="inventory-slots">
                        {inventory.map((item, index) => (
                            <div className="slot" key={index}>
                                <p>{item.title}</p>
                                <button onClick={() => handleEquipItem(item, item.category)}>Equipar</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
