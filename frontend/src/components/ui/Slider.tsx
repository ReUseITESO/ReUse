export default function Slider(props) {
	const { value, onChange, min = 0, max = 100, step = 1 } = props;
	return (
		<div className="slidecontainer">
			<input type="range" min={min} max={max} value={value} className="slider" onChange={e => onChange(parseInt(e.target.value))}/>
		</div>
	);
}