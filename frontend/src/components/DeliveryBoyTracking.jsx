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
        if (!loc) return null
        if (Array.isArray(loc)) {
            const lat = Number(loc[1])
            const lon = Number(loc[0])
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
            if (lat === 0 && lon === 0) return null
            return [lat, lon]
        }
        const lat = Number(loc.lat)
        const lon = Number(loc.lon)
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
        if (lat === 0 && lon === 0) return null
        return [lat, lon]
    }

    const dbPos = getPos(deliveryBoyLocation)
    const custPos = getPos(customerLocation)

    const fallbackCenter = [20.5937, 78.9629]
    const center = dbPos || custPos || fallbackCenter
    const path = dbPos && custPos ? [dbPos, custPos] : []

    return (
        <div className='w-full h-full rounded-xl overflow-hidden shadow-md border border-gray-100'>
            <MapContainer
                className="w-full h-full"
                center={center}
                zoom={16}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {dbPos && (
                    <Marker position={dbPos} icon={deliveryBoyIcon}>
                        <Popup>Delivery Boy (You)</Popup>
                    </Marker>
                )}

                {custPos && (
                    <Marker position={custPos} icon={customerIcon}>
                        <Popup>Customer Location</Popup>
                    </Marker>
                )}

                {path.length > 0 && (
                    <Polyline positions={path} color='#ff4d2d' weight={4} dashArray="10, 10" />
                )}

                {dbPos && <RecenterMap position={dbPos} />}
            </MapContainer>
        </div>
    )
}

export default DeliveryBoyTracking
