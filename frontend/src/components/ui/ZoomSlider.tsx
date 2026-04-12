interface ZoomSliderProps {
  zoom: number;
  onChange: (newZoom: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function ZooomSlider(props: ZoomSliderProps) {
  const { zoom, onChange, min = 0.5, max = 6, step = 0.25 } = props;
  return (
    <div className="slidecontainer flex items-center justify-center gap-4 bg-primary/5 p-4 rounded">
      <button
        onClick={() => onChange(Math.max(zoom - step, min))}
        className="px-2 py-1 bg-primary/20 rounded-l"
      >
        -
      </button>
      <div className="slider">
        <input
          type="range"
          value={zoom}
          min={min}
          max={max}
          step="any"
          onChange={e => onChange(parseFloat(e.target.value))}
          className="bg-gray-200 h-2 rounded-lg"
        />
      </div>
      <button
        onClick={() => onChange(Math.min(zoom + step, max))}
        className="px-2 py-1 bg-primary/20 rounded-r"
      >
        +
      </button>
      <div className="text-sm text-gray-600">Zoom: {(zoom * 100).toFixed(0)}%</div>
    </div>
  );
}
