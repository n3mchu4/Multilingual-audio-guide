import { Pressable, Text, View } from 'react-native';

export default function NavigationMap({ placesList, lang, selected, onSelect }) {
  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        {lang === 'vi' ? 'Chọn địa danh' : 'Choose a landmark'}
      </Text>

      {placesList.map((place, index) => (
        <Pressable
          key={place.id ?? index}
          onPress={() => onSelect(index)}
          style={{
            padding: 12,
            borderRadius: 8,
            backgroundColor: selected === index ? '#fce7f3' : '#f3f4f6',
          }}
        >
          <Text>{place.name?.[lang] ?? place.name?.vi}</Text>
        </Pressable>
      ))}
    </View>
  );
}