import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native'
import * as Location from 'expo-location'
import { useEffect, useState, useRef } from 'react'
import MapView, { LatLng, Marker, Region, MapViewProps } from 'react-native-maps'

const _layout = () => {

  //agregado para que se muestre mejor data que longitud y latitud en el mapa
  const [geoAddress, setGeoAddress] = useState<Location.LocationGeocodedAddress | null>(null);

  // --------------- CODIGO QUE NO TIENE RELACION CON EL VIDEO DEL MAPA ------------------
  const [location, setLocation] = useState<Location.LocationObject | null>(); //con esto y la varuable currentLocation
  //se tiene la data cercana de un currentLocation para poder redirigirlo en el componente map

  //sirve para que busqué el nombre de una calle/avenida, negocio, lugar turistico, etc
  const [address, setAddress] = useState<string>()

  //Referencia para el cambio de vista de mapa cuando se haga una busqueda
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const getPermissions = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if(status !== "granted"){
        console.log("Debe otorgar permisos de ubicación")
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      // console.log("Location:", currentLocation)
    };

    getPermissions()

  }, [])
  
  //con esta función se obtiene informacion como latitud y longitud en base a lo que se haya buscadp
  const geocode = async () => {
    const geocodeLocation = await Location.geocodeAsync(address ?? "");
  
    if (geocodeLocation.length > 0) {
      const { latitude, longitude } = geocodeLocation[0];
  
      // Actualizar la posición del marcador
      setDraggableMarkerCoord({ latitude, longitude });
  
      // Centrar el mapa en la nueva ubicación
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01, // puedes ajustar el zoom aquí
        longitudeDelta: 0.01,
      });
  
      console.log("Dirección geolocalizada:", geocodeLocation);
    } else {
      console.log("No se encontró la dirección");
    }
  };

  //esta función convertirá latitud y longitud a un objeto con información como una ciudad, pais, etc.
  const reverseGeocode = async () => {
    // const reverseGeocodeAddress = await Location.reverseGeocodeAsync({
    //   latitude: location?.coords.latitude ?? 0,
    //   longitude: location?.coords.longitude ?? 0
    // })
    
    // console.log("Geolocalización revertida", reverseGeocodeAddress)

    //Esto es en base a lo de la ubicación que esta en el mapa:
    const reverseGeocodeAddress = await Location.reverseGeocodeAsync({
      latitude: draggableMarkerCoord?.latitude ?? 0,
      longitude: draggableMarkerCoord?.longitude ?? 0
    });
    
    console.log("Geolocalización revertida", reverseGeocodeAddress)

    if (reverseGeocodeAddress.length > 0) {
      setGeoAddress(reverseGeocodeAddress[0]);
    } else {
      setGeoAddress(null);
    }

  }
  // --------------- CODIGO QUE NO TIENE RELACION CON EL VIDEO DEL MAPA ------------------


  // --------------- CODIGO QUE TIENE RELACION CON EL VIDEO DEL MAPA ------------------
  const onRegionChange = (region: Region) => {
    // console.log(region);
  }

  const [draggableMarkerCoord, setDraggableMarkerCoord] = useState<LatLng>({
    // longitude: location?.coords.longitude ?? 0,
    // latitude: location?.coords.latitude ?? 0
    longitude: 0,
    latitude: 0
  })
  // --------------- CODIGO QUE TIENE RELACION CON EL VIDEO DEL MAPA ------------------

  //ESTO NO ES PARTE DEL VIDEO PERO ES PARA QUE QUEDE DIRECTAMENTE CON UN VALOR SETEADO QUEMADO
  useEffect(() => {
    if (location) {
      setDraggableMarkerCoord({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  }, [location]);

  //ESTO NO ES PARTE DEL VIDEO PAERO ES PARA QUE SE VEA MEJOR LA DATA DEL MAPA
  useEffect(() => {
    if (draggableMarkerCoord.latitude !== 0 && draggableMarkerCoord.longitude !== 0) {
      reverseGeocode();
    }
  }, [draggableMarkerCoord]);

  console.log(draggableMarkerCoord)
  return (
    <>
      <View style={style.container}>
        
        <View style={style.mapContainer}>
          <MapView 
            style={style.map}
            // onRegionChange={onRegionChange}
            initialRegion={{    //este valor se usa con la función onRegionChange para encontrar la region en el mapa
              //estos valores son aproximadamente cerca de santa rosa
              latitude: 14.77384821117998, 
              latitudeDelta: 0.07076751150266958, 
              longitude: -88.77573939040303, 
              longitudeDelta: 0.05421247333288193
            }}
            provider='google'
            ref={mapRef}
          >
            {location && (  //esta condicional fue agregada
              <Marker 
                draggable
                coordinate={draggableMarkerCoord}
                onDragEnd={(e) => setDraggableMarkerCoord(e.nativeEvent.coordinate)}
                // pinColor=''    //se puede especificar un color personalizado en hexadecimal si se quiere
              />
            )}
          </MapView>
            <Text style={style.mapOverlay}>
              Ciudad: {geoAddress?.city ?? "No disponible"}{"\n"}
              Región: {geoAddress?.region ?? "No disponible"}{"\n"}
              País: {geoAddress?.country ?? "No disponible"}
            </Text>
        </View>

        <View style={style.controlsContainer}>
          <TextInput 
            placeholder = 'Dirección'
            value={address}
            onChangeText={setAddress}
            style={style.input}
          />
          <Pressable
            style={style.button}
            onPress={geocode}
          >
            <Text style={style.buttonText}>Geolocalizar dirección</Text>
          </Pressable>

          {/* <Pressable
            style={style.button}
            onPress={reverseGeocode}
          >
          </Pressable> */}
        </View>
      </View>
    </>
  )
}

const style = StyleSheet.create({
  container: {
    flex: 1, // Ocupa el 100% de la pantalla
    backgroundColor: "#fff",
  },
  mapContainer: {
    flex: 3, // 75% del alto
    position: 'relative'
  },
  map: {
    flex: 1, // Llenar su contenedor
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 10, //antes 50
    alignSelf: 'center',    //nuevo
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 5,
    padding: 16,
    left: '25%',
    width: '50%',
    textAlign: 'center'
  },
  controlsContainer: {
    flex: 1, // 25% del alto
    padding: 10,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  button: {
    padding: 12,
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});


export default _layout