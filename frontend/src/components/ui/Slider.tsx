interface SliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function Slider({ value, min, max, onChange }: SliderProps) {
  return (
    <div className="w-full py-2">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="
          w-full h-1.5 rounded-lg appearance-none cursor-pointer 
          bg-border             /* Changed from bg-muted for visibility */
          accent-primary        /* Colors the 'thumb' */
          hover:accent-secondary 
          transition-all
          [&::-webkit-slider-runnable-track]:bg-transparent
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-primary
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-bg
          [&::-webkit-slider-thumb]:shadow-sm
        "
      />
    </div>
  );
}