import { MAP_BASE_LAYERS } from "../lib/mapLayers";

type Props = {
  value: string;
  onChange: (layerId: string) => void;
};

export function MapLayerSelector({ value, onChange }: Props) {
  return (
    <div className="map-layer-select-wrap">
      <label htmlFor="map-base-layer" className="map-layer-select-label">
        Map layer
      </label>
      <select
        id="map-base-layer"
        className="map-layer-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {MAP_BASE_LAYERS.map((layer) => (
          <option key={layer.id} value={layer.id}>
            {layer.name}
          </option>
        ))}
      </select>
    </div>
  );
}
