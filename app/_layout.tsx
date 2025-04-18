import { View, Text } from 'react-native'
import * as Location from 'expo-location'
import { useEffect, useState } from 'react'

const _layout = () => {

  const [location, setLocation] = useState<Location.LocationObject | null>();

  useEffect(() => {
    const getPermissions = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if(status !== "granted"){
        console.log("Debe otorgar permisos de ubicación")
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      console.log("Location:", currentLocation)
    };

    getPermissions()

  }, [])
  

  return (
    <View>
      <Text>_layout</Text>
    </View>
  )
}

export default _layout