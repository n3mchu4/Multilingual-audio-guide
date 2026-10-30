import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

// Kiểm tra địa danh có tọa độ hợp lệ để hiển thị trên bản đồ.
function hasCoordinates(place) {
  return (
    Number.isFinite(place?.lat) &&
    Number.isFinite(place?.lng) &&
    Math.abs(place.lat) <= 90 &&
    Math.abs(place.lng) <= 180
  );
}

// Hiển thị bản đồ thật, các địa danh và vị trí GPS của người dùng.
export default function NavigationMap({
  placesList,
  lang,
  selected,
  onSelect,
  userLoc,
  locStatus,
  onMyLocation,
}) {
  const mapRef = useRef(null);
  const selectedPlace = placesList[selected];
  const vi = lang === 'vi';

  // Di chuyển bản đồ đến vị trí người dùng sau khi lấy được GPS.
  useEffect(() => {
    if (!hasCoordinates(userLoc)) return;

    mapRef.current?.animateToRegion(
      {
        latitude: userLoc.lat,
        longitude: userLoc.lng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      600
    );
  }, [userLoc]);

  // Di chuyển bản đồ đến địa danh được chọn trong danh sách.
  useEffect(() => {
    if (!hasCoordinates(selectedPlace)) return;

    mapRef.current?.animateToRegion(
      {
        latitude: selectedPlace.lat,
        longitude: selectedPlace.lng,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      },
      600
    );
  }, [selectedPlace]);

  return (
    <View>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 10.777,
          longitude: 106.701,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        }}
        showsUserLocation={locStatus === 'ok'}
        showsMyLocationButton={locStatus === 'ok'}
        zoomEnabled
        scrollEnabled
        rotateEnabled
      >
        {placesList.map((place, index) => {
          if (!hasCoordinates(place)) return null;

          return (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.lat,
                longitude: place.lng,
              }}
              title={place.name[lang]}
              pinColor={selected === index ? '#d63384' : '#167d78'}
              onPress={() => onSelect(index)}
            />
          );
        })}
      </MapView>

      <View style={styles.controls}>
        <Pressable
          style={styles.button}
          onPress={onMyLocation}
          disabled={locStatus === 'loading'}
        >
          <Text style={styles.buttonText}>
            {locStatus === 'loading'
              ? (vi ? 'Đang lấy vị trí...' : 'Getting location...')
              : locStatus === 'denied'
                ? (vi ? 'Mở cài đặt vị trí' : 'Open location settings')
                : (vi ? '📍 Vị trí của tôi' : '📍 My location')}
          </Text>
        </Pressable>

        {locStatus === 'denied' && (
          <Text style={styles.note}>
            {vi
              ? 'Bạn cần cấp quyền vị trí trong cài đặt điện thoại.'
              : 'Allow location access in your phone settings.'}
          </Text>
        )}

        {locStatus === 'error' && (
          <Text style={styles.note}>
            {vi
              ? 'Chưa lấy được vị trí. Bật GPS rồi nhấn thử lại.'
              : 'Location unavailable. Enable GPS and try again.'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 360,
  },
  controls: {
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
  },
  button: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#e9f4f2',
    alignItems: 'center',
  },
  buttonText: {
    color: '#167d78',
    fontWeight: '700',
  },
  note: {
    color: '#65717d',
    fontSize: 13,
    lineHeight: 20,
  },
});