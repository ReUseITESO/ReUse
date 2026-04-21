interface ZoomSliderProps {
	zoom: number;
	onChange: (newZoom: number) => void;	
	min?: number;
	max?: number;
	step?: number;
}

export default function ZoomSlider(props: ZoomSliderProps) {
    const { zoom, onChange, min = 0.5, max = 4, step = 0.25 } = props;

    return (
        <div className="flex items-center gap-5 w-full bg-primary/5 p-4 rounded-2xl border border-primary/10 shadow-lg">
            <button 
                onClick={() => onChange(Math.max(zoom - step, min))} 
                className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-xl transition-all hover:bg-primary-hover active:scale-90 font-bold text-xl shadow-md"
            >
                -
            </button>

            <div className="flex-1 flex items-center">
                <input 
                    type="range" 
                    value={zoom} 
                    min={min}
                    max={max}
                    step="any"
                    onChange={e => onChange(parseFloat(e.target.value))}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer bg-primary/10 accent-secondary hover:accent-primary transition-all"
                />
            </div>

            <button 
                onClick={() => onChange(Math.min(zoom + step, max))} 
                className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-xl transition-all hover:bg-primary-hover active:scale-90 font-bold text-xl shadow-md"
            >
                +
            </button>

            <div className="min-w-[50px] text-right text-base font-black text-primary tabular-nums">
                {(zoom * 100).toFixed(0)}%
            </div>
        </div>
    );
}