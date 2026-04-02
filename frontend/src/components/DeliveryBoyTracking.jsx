import React, { useEffect, useState } from 'react'
import L from "leaflet"
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import "leaflet/dist/leaflet.css"

import scooter from "../assets/scooter.png"
import home from "../assets/home.png"

const deliveryBoyIcon = new L.Icon({
    iconUrl: scooter,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
})

const customerIcon = new L.Icon({
    iconUrl: home,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
})

function RecenterMap({ position }) {
    const map = useMap()
    useEffect(() => {
        if (position) map.setView(position, 16)
    }, [position, map])
    return null
}

function DeliveryBoyTracking({ deliveryBoyLocation, customerLocation }) {
    // Handle both {lat, lon} and [lon, lat] formats
    const getPos = (loc) => {
        if (!loc) return [0, 0]
        if (Array.isArray(loc)) return [loc[1], loc[0]]
        return [loc.lat, loc.lon]
    }

    const dbPos = getPos(deliveryBoyLocation)
    const custPos = getPos(customerLocation)

    const path = [dbPos, custPos]

    return (
        <div className='w-full h-full rounded-xl overflow-hidden shadow-md border border-gray-100'>
            <MapContainer
                className="w-full h-full"
                center={dbPos}
                zoom={16}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <Marker position={dbPos} icon={deliveryBoyIcon}>
                    <Popup>Delivery Boy (You)</Popup>
                </Marker>

                <Marker position={custPos} icon={customerIcon}>
                    <Popup>Customer Location</Popup>
                </Marker>

                <Polyline positions={path} color='#ff4d2d' weight={4} dashArray="10, 10" />
                <RecenterMap position={dbPos} />
            </MapContainer>
        </div>
    )
}

export default DeliveryBoyTracking
