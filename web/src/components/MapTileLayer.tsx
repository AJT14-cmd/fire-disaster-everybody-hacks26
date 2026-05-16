import { TileLayer } from "react-leaflet";
import { DEFAULT_MAP_LAYER_ID, MAP_BASE_LAYERS } from "../lib/mapLayers";

type Props = {
  layerId: string;
};

export function MapTileLayer({ layerId }: Props) {
  const layer =
    MAP_BASE_LAYERS.find((item) => item.id === layerId) ??
    MAP_BASE_LAYERS.find((item) => item.id === DEFAULT_MAP_LAYER_ID)!;

  return (
    <TileLayer
      key={layer.id}
      url={layer.url}
      attribution={layer.attribution}
      maxZoom={layer.maxZoom}
      subdomains={layer.subdomains ?? "abc"}
    />
  );
}
