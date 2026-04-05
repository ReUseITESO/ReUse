interface SliderProps {
	value: number;
	onChange: (newValue: number) => void;
	min?: number;
	max?: number;
}

export default function Slider(props: SliderProps) {
	const { value, onChange, min = 0, max = 100} = props;
	return (
		<div className="slidecontainer">
			<input type="range" min={min} max={max} value={value} className="slider" onChange={e => onChange(parseInt(e.target.value))}/>
		</div>
	);
}