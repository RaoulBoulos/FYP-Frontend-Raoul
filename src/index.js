
import React, { useState } from 'react';
import { render } from 'react-dom';
import Chart from './Chart';
import { getData } from "./utils";
import { Digital } from "react-activity"; 
import "react-activity/dist/library.css";
import { Checkbox } from 'react-bootstrap';

class ChartComponent extends React.Component {
	componentWillReceiveProps(nextProps) {
		getData(nextProps.ticker).then(data => this.setState({data}));
	}
	componentDidMount() {
		getData(this.props.ticker).then(data => this.setState({data}));
	}
	render() {
		if (this.state == null) {
			return <Digital size={100} style={{position: 'absolute', left: '50%', top: '20%', transform: 'translate(-50%, -50%)', background: "#303030", width: 2000, height: 350, color: "#FFFFFF"}}/>
		}
		return (
			<div style={{background: "#303030"}}>
				<Chart type={"hybrid"} ticker={this.props.ticker}  data={this.state.data}/>
			</div>
		)
	}
}

const App = () => {
	let tickers = ["AAPL","TSLA","AMZN","NFLX","INTC","ORCL","FB","NVDA","GOOGL","AMD","MSFT"];
	const [ticker, setTicker] = useState(tickers[0]);
	return (
		<div>
		<ChartComponent ticker={ticker}/>
		<Checkbox label='Apple' onChange={() => setTicker(tickers[0])}/>Apple
		<Checkbox label='Tesla' onChange={() => setTicker(tickers[1])}/>Tesla
		<Checkbox label='Amazon' onChange={() => setTicker(tickers[2])}/>Amazon
		<Checkbox label='Netflix' onChange={() => setTicker(tickers[3])}/>Netflix
		<Checkbox label='Intel' onChange={() => setTicker(tickers[4])}/>Intel
		<Checkbox label='Oracle' onChange={() => setTicker(tickers[5])}/>Oracle
		<Checkbox label='Meta' onChange={() => setTicker(tickers[6])}/>Meta
		<Checkbox label='NVIDIA' onChange={() => setTicker(tickers[7])}/>NVIDIA
		<Checkbox label='Google' onChange={() => setTicker(tickers[8])}/>Google
		<Checkbox label='AMD' onChange={() => setTicker(tickers[9])}/>AMD
		<Checkbox label='Microsoft' onChange={() => setTicker(tickers[10])}/>Microsoft
		</div>
	);
}

render(<App />, document.getElementById("root"));