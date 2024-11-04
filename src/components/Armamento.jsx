import React from "react";
import ItemCard from "./ItemCard";
import Pistola from '../assets/semi-automatic-handgun-on-a-solid-color-background-close-up-ai-generative-free-photo.jpg'

export default function Armamento() {
    return (
        <div className="category-content">
            <h2>Armamento</h2>
            <ItemCard 
                title="Pistola"
                imageSrc={Pistola}
                description="Una pistola de 9mm"
                price="2590"
                category="Armamento"
                proBarName="Daño"
                proBarTxtColor="black"
                proBarBgColor="red"
                proBarPercentage="20"
            />
        </div>
    )
}