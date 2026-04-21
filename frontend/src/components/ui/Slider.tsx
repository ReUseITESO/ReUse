interface SliderProps {
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function Slider({ value, min, max, onChange, disabled }: SliderProps) {

  return (
    <div className="w-full py-4">
      <input
        type="range"
        disabled={disabled}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-3 rounded-full appearance-none transition-all
          ${disabled 
            ? 'bg-gray-300 cursor-not-allowed accent-gray-400' 
            : 'bg-primary/20 cursor-pointer accent-secondary hover:accent-primary'}
          
          [&::-webkit-slider-thumb]:appearance-none 
          [&::-webkit-slider-thumb]:h-5 
          [&::-webkit-slider-thumb]:w-5 
          [&::-webkit-slider-thumb]:rounded-full 
          ${disabled 
            ? '[&::-webkit-slider-thumb]:bg-gray-400 [&::-webkit-slider-thumb]:border-gray-200' 
            : '[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-primary'}
        `}
      />
    </div>
  );
}