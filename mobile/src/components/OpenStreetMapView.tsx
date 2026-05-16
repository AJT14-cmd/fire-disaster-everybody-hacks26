import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import MapView, {
  Circle,
  Marker,
  Polyline,
  UrlTile,
  type MapViewProps,
  type Region
} from "react-native-maps";
import { OSM_ATTRIBUTION, OSM_MAX_ZOOM, OSM_TILE_URL } from "../config/map";
import { colors } from "../theme/colors";

type LatLng = { latitude: number; longitude: number };

type Props = {
  style?: StyleProp<ViewStyle>;
  initialRegion: Region;
  children?: React.ReactNode;
  routes?: LatLng[][];
  mapProps?: Partial<MapViewProps>;
};

export function OpenStreetMapView({ style, initialRegion, children, routes = [], mapProps }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <MapView
        {...mapProps}
        style={styles.map}
        initialRegion={initialRegion}
        mapType="none"
      >
        <UrlTile urlTemplate={OSM_TILE_URL} maximumZ={OSM_MAX_ZOOM} zIndex={-1} />
        {routes.map((coordinates, index) => (
          <Polyline
            key={`route-${index}`}
            coordinates={coordinates}
            strokeColor={colors.accent}
            strokeWidth={4}
          />
        ))}
        {children}
      </MapView>
      <Text style={styles.attribution}>{OSM_ATTRIBUTION}</Text>
    </View>
  );
}

export { Circle, Marker };
