
import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
	BarSeries,
	AreaSeries,
	CandlestickSeries,
	LineSeries,
	MACDSeries,
	BollingerSeries
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	EdgeIndicator,
	CurrentCoordinate,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
	OHLCTooltip,
	MovingAverageTooltip,
	MACDTooltip,
	BollingerBandTooltip
} from "react-stockcharts/lib/tooltip";
import { Label } from "react-stockcharts/lib/annotation";
import { ema, macd, sma, bollingerBand } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";

const bbStroke = {
	top: "#964B00",
	middle: "#000000",
	bottom: "#964B00",
};

const bbFill = "#4682B4";

const macdAppearance = {
	stroke: {
		macd: "#FF0000",
		signal: "#00F300",
	},
	fill: {
		divergence: "#4682B4"
	},
};

const mouseEdgeAppearance = {
	textFill: "#542605",
	stroke: "#05233B",
	strokeOpacity: 1,
	strokeWidth: 3,
	arrowWidth: 5,
	fill: "#BCDEFA",
};

class CandleStickChartWithMACDIndicator extends React.Component {
	render() {
		const { type, data: initialData, width, ratio } = this.props;
		const ema26 = ema()
			.options({
				windowSize: 26,
				sourcePath: "close",
			})
			.id(0)
			.merge((d, c) => { d.ema26 = c; })
			.accessor(d => d.ema26);

		const ema12 = ema()
			.options({
				windowSize: 12,
				sourcePath: "close",
			})
			.id(1)
			.merge((d, c) => {d.ema12 = c;})
			.accessor(d => d.ema12);

		const macdCalculator = macd()
			.options({
				fast: 12,
				slow: 26,
				signal: 9,
			})
			.merge((d, c) => {d.macd = c;})
			.accessor(d => d.macd);

		const smaVolume50 = sma()
			.id(3)
			.options({
				windowSize: 50,
				sourcePath: "volume",
			})
			.merge((d, c) => {d.smaVolume50 = c;})
			.accessor(d => d.smaVolume50)
			.stroke("#4682B4")
			.fill("#4682B4");

		const bb = bollingerBand()
			.merge((d, c) => {d.bb = c;})
			.accessor(d => d.bb);

		const calculatedData = smaVolume50(macdCalculator(ema12(ema26(bb(initialData)))));
		const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);
		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(calculatedData);

		const gridHeight = 550;
		const gridWidth = width-140;
		const showGrid = true;
		const yGrid = showGrid ? {innerTickSize: -1*gridWidth, tickStrokeOpacity: 0.2} : {};
		const xGrid = showGrid ? {innerTickSize: -1*gridHeight, tickStrokeOpacity: 0.2} : {};

		return (
			<ChartCanvas height={600}
				width={width}
				ratio={ratio}
				margin={{ left: 70, right: 70, top: 20, bottom: 30 }}
				type={type}
				seriesName="AMZN"
				data={data}
				xScale={xScale}
				xAccessor={xAccessor}
				//xExtents={[new Date(2018,0,1), new Date(2022,0,1)]}
				displayXAccessor={displayXAccessor}
			>
				<Label x={(width - 70 - 70) / 2} y={30}
					fontSize="30" fill="#FFFFFF" text="Amazon" />
				<Chart id={1} height={400}
					yExtents={[d => [d.high, d.low], ema26.accessor(), ema12.accessor(), bb.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
					<YAxis axisAt="right" orient="right" ticks={5} {...yGrid}/>

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")}
						{...mouseEdgeAppearance}
					/>

					<CandlestickSeries />
					<BollingerSeries 
					yAccessor={d => d.bb}
					stroke={bbStroke}
					fill={bbFill}
					/>

					<LineSeries yAccessor={ema26.accessor()} stroke={ema26.stroke()}/>
					<LineSeries yAccessor={ema12.accessor()} stroke={ema12.stroke()}/>

					<CurrentCoordinate yAccessor={ema26.accessor()} fill={ema26.stroke()} />
					<CurrentCoordinate yAccessor={ema12.accessor()} fill={ema12.stroke()} />

					<EdgeIndicator itemType="last" orient="right" edgeAt="right"
						yAccessor={d => d.close}
						fill={d => d.close > d.open ? "#A2F5BF" : "#F9ACAA"}
						stroke={d => d.close > d.open ? "#0B4228" : "#6A1B19"}
						textFill={d => d.close > d.open ? "#0B4228" : "#420806"}
						strokeOpacity={1}
						strokeWidth={3}
						arrowWidth={2}
					/>

					<OHLCTooltip origin={[-40, 0]} textFill={"#FFFFFF"}/>
					<MovingAverageTooltip
						onClick={e => console.log(e)}
						origin={[-38, 15]}
						options={[
							{
								yAccessor: ema26.accessor(),
								type: "EMA",
								stroke: ema26.stroke(),
								windowSize: ema26.options().windowSize,
							},
							{
								yAccessor: ema12.accessor(),
								type: "EMA",
								stroke: ema12.stroke(),
								windowSize: ema12.options().windowSize,
							},
						]}
						textFill={"#FFFFFF"}
					/>
					<BollingerBandTooltip 
					origin={[-38, 60]}
					yAccessor={d => d.bb}
					options={bb.options()}
					textFill={"#FFFFFF"}
					/>
				</Chart>
				<Chart id={2} height={150}
					yExtents={[d => d.volume, smaVolume50.accessor()]}
					origin={(w, h) => [0, h - 300]}
				>
					<YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".2s")}/>

					<MouseCoordinateY
						at="left"
						orient="left"
						displayFormat={format(".4s")}
						{...mouseEdgeAppearance}
					/>

					<BarSeries yAccessor={d => d.volume} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />
					<AreaSeries yAccessor={smaVolume50.accessor()} stroke={smaVolume50.stroke()} fill={smaVolume50.fill()}/>
				</Chart>
				<Chart id={3} height={150}
					yExtents={macdCalculator.accessor()}
					origin={(w, h) => [0, h - 150]} padding={{ top: 10, bottom: 10 }}
				>
					<XAxis axisAt="bottom" orient="bottom" {...xGrid}/>
					<YAxis axisAt="right" orient="right" ticks={2} />

					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")}
						rectRadius={5}
						{...mouseEdgeAppearance}
					/>
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")}
						{...mouseEdgeAppearance}
					/>

					<MACDSeries yAccessor={d => d.macd}
						{...macdAppearance} />
					<MACDTooltip
						origin={[-38, 15]}
						yAccessor={d => d.macd}
						options={macdCalculator.options()}
						appearance={macdAppearance}
					/>
				</Chart>
				<CrossHairCursor />
			</ChartCanvas>
		);
	}
}

CandleStickChartWithMACDIndicator.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickChartWithMACDIndicator.defaultProps = {
	type: "svg",
};

CandleStickChartWithMACDIndicator = fitWidth(CandleStickChartWithMACDIndicator);

export default CandleStickChartWithMACDIndicator;
