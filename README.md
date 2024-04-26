Real-time Ride-Share Tracking

## Approach

### Dependencies

- `@vis.gl/react-google-maps`: This library provides React components for integrating Google Maps into a React application.
- `@turf/turf`: Used for geospatial analysis, specifically for calculating distances between stops.

### Components

- **MapPage**: The main component responsible for rendering the map, markers, and info windows.
- **AdvancedMarker**: Custom marker component provided by `@vis.gl/react-google-maps`.
- **InfoWindow**: Info window component provided by `@vis.gl/react-google-maps`.
- **useMap**: Custom hook provided by `@vis.gl/react-google-maps` for accessing the map instance.
- **useAdvancedMarkerRef**: Custom hook provided by `@vis.gl/react-google-maps` for managing marker references.

### Functionality

- **Display Stops**: The stops along the route are displayed as markers on the map.
- **Info Windows**: Clicking on a marker opens an info window displaying additional information about the stop.
- **Current Location Marker**: The user's current location is displayed as a marker on the map.
- **Distance and ETA Calculation**: Calculates the distance and estimated time of arrival (ETA) to the next stop based on the user's current location.
- **Route Rendering**: Draws the route between the starting point and the ending point using Google Maps Directions Service.
- **Reverse geocode to get the name of the location** : Google Maps directions service will return the name of the location where the driver is located


## Setup Instructions

1. Clone the repository

   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory
    ``` bash
    cd <project-directory>
    ```
3. Install dependencies
    ```bash
    pnpm install
    ```
4. Obtain a Google Maps API key from the Google Cloud Console.

5. Set up environment variables

    ```bash 
    Create a .env file in the root directory of the project.
    Add your Google Maps API key to the .env file
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-api-key>
    NEXT_PUBLIC_MAP_ID = <your-map-id>
    ```

6. Start the development server
    ```
    pnpm dev
    ```

7. Open your web browser and navigate to http://localhost:3000 to view the application.

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

