'use client';
import React, { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap, useMapsLibrary, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { point, distance } from "@turf/turf";

type Stop = {
    name: string;
    position: { lat: number; lng: number };
    info: string;
};



export default function MapPage() {

    const stops: Stop[] = [
        { name: "Nyabugogo", position: { lat: -1.939826787816454, lng: 30.0445426438232 }, info: "Starting Point" },
        { name: "Stop A", position: { lat: -1.9355377074007851, lng: 30.060163829002217 }, info: "" },
        { name: "Stop B", position: { lat: -1.9358808342336546, lng: 30.08024820994666 }, info: "" },
        { name: "Stop C", position: { lat: -1.9489196023037583, lng: 30.092607828989397 }, info: "" },
        { name: "Stop D", position: { lat: -1.9592132952818164, lng: 30.106684061788073 }, info: "" },
        { name: "Stop E", position: { lat: -1.9487480402200394, lng: 30.126596781356923 }, info: "" },
        { name: "Kimironko", position: { lat: -1.9365670876910166, lng: 30.13020167024439 }, info: "Ending Point" },
    ];
    const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [currentLocationName, setCurrentLocationName] = useState<string | null>(null);
    useEffect(() => {
        if (!navigator.geolocation) {
            console.log("Geolocation is not supported by your browser");
        } else {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    console.log("Location permission granted");
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    // Reverse geocode to get the name of the location
                    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
                    const data = await response.json();
                    if (data && data.results && data.results[0]) {
                        const locationName = data.results[0].formatted_address;
                        setCurrentLocationName(locationName);
                    }
                },
                (error) => {
                    console.log("Error occurred while getting location permission", error);
                }
            );
        }
    }, []);

    useEffect(() => {
        let watcher = null;

        if (navigator.geolocation) {
            watcher = navigator.geolocation.watchPosition(
                async (position) => {

                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.log("Error occurred while watching location", error);
                }
            );
        }
        return () => {
            if (watcher) {
                navigator.geolocation.clearWatch(watcher);
            }
        };
    }, []);
    const [infowindowShown, setInfowindowShown] = useState(false);
    const [markerRef, marker] = useAdvancedMarkerRef();

    const toggleInfoWindow = () => setInfowindowShown((previousState) => !previousState);
    const closeInfoWindow = () => setInfowindowShown(false);

    const [eta, setEta] = useState(0);
    const [distanceToNextStop, setDistanceToNextStop] = useState(0);
    const [nextStopName, setNextStopName] = useState('');

    useEffect(() => {
        if (currentLocation && stops.length > 0) {
            const currentPoint = point([currentLocation.lng, currentLocation.lat]);
            const nextStopPoint = point([stops[1].position.lng, stops[1].position.lat]);
            // console.log("next stop point", nextStopPoint);
            // console.log("Name", stops[0].name);
            const calculatedDistance = distance(currentPoint, nextStopPoint, "kilometers");
            setDistanceToNextStop(calculatedDistance);
            setNextStopName(stops[1].name);
            const averageSpeed = 60; // Average speed in km/h
            const timeToNextStop = (calculatedDistance / averageSpeed) * 60;
            setEta(timeToNextStop);
        }
    }, [currentLocation, stops]);

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <div style={{ height: "100vh", width: "100%", position: "relative" }}>
                <Map zoom={13} center={stops[0].position} mapId={process.env.NEXT_PUBLIC_MAP_ID} fullscreenControl={false}>
                    {stops.map((stop, index) => (
                        <AdvancedMarker
                            key={index}
                            position={stop.position}
                            title={stop.name}
                            onClick={() => setSelectedStop(stop)}
                        />
                    ))}
                    {selectedStop && (
                        <InfoWindow position={selectedStop.position} onCloseClick={() => setSelectedStop(null)}>
                            <p>{selectedStop.name}</p>
                            <p>{selectedStop.info}</p>
                        </InfoWindow>
                    )}
                    {currentLocation && (
                        <AdvancedMarker
                            ref={markerRef}
                            position={currentLocation}
                            title="Current Location"
                            onClick={toggleInfoWindow}
                        />
                    )}
                    {infowindowShown && (
                        <InfoWindow anchor={marker} onCloseClick={closeInfoWindow}>
                            <p className="text-sm">Driver Current Location</p>
                            <p className="text-sm">{currentLocationName}</p>
                        </InfoWindow>
                    )}
                    {eta !== null && distanceToNextStop !== null && nextStopName && currentLocation && (
                        <div className="bg-white p-4 rounded absolute top-0 right-0 w-auto">
                            <div className="text-sm">
                
                                <p className="text-sm">Next Stop: {nextStopName}</p>
                                <p className="text-sm">Distance to Next Stop: {distanceToNextStop.toFixed(2)} km</p>
                                <p className="text-sm">ETA to Next Stop: {eta.toFixed(2)} minutes</p>
                            </div>
                        </div>
                    )}
                    <Directions />
                </Map>
            </div>
        </APIProvider>
    );
}


function Directions() {
    const map = useMap();
    const routesLibrary = useMapsLibrary("routes");
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();
    const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
    const [routeIndex, setRouteIndex] = useState(0);
    const selected = routes[routeIndex];
    const leg = selected?.legs[0];

    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsService(new routesLibrary.DirectionsService());
        setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
    }, [routesLibrary, map]);

    useEffect(() => {
        if (!directionsService || !directionsRenderer) return;

        directionsService
            .route({
                origin: "Nyabugogo",
                destination: "Kimironko",
                travelMode: google.maps.TravelMode.DRIVING,
                provideRouteAlternatives: true,
            })
            .then((response) => {
                directionsRenderer.setDirections(response);
                setRoutes(response.routes);
            });

        return () => directionsRenderer.setMap(null);
    }, [directionsService, directionsRenderer]);

    useEffect(() => {
        if (!directionsRenderer) return;
        directionsRenderer.setRouteIndex(routeIndex);
    }, [routeIndex, directionsRenderer]);

    if (!leg) return null;

    return (
        <div className="grid justify-items-end absolute bottom-0 right-0 w-auto">
            <div className="bg-white p-4 rounded">
                <h2 className="text-lg">{selected.summary}</h2>
                <p className="text-sm font-bold">
                    {leg.start_address.split(",")[0]} to {leg.end_address.split(",")[0]}
                </p>
                <p className="text-sm">Distance: {leg.distance?.text}</p>
                <p className="text-sm ">Duration: {leg.duration?.text}</p>

                <h2 className="text-lg font-bold">Possible Routes</h2>
                <ul className="pl-2 p-0 m-0">
                    {routes.map((route, index) => (
                        <li key={route.summary} className="text-sm cursor-pointer border-none bg-none items-start">
                            <button onClick={() => setRouteIndex(index)} className="text-blue-600">
                                {route.summary}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

    );
}