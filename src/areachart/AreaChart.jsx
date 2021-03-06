'use strict';

var React = require('react');
var d3 = require('d3');
var DataSeries = require('./DataSeries');
var common = require('../common');
var Chart = common.Chart;
var XAxis = common.XAxis;
var YAxis = common.YAxis;
var mixins = require('../mixins');
var CartesianChartPropsMixin = mixins.CartesianChartPropsMixin;


module.exports = React.createClass({

  mixins: [ CartesianChartPropsMixin ],

  propTypes: {
    margins: React.PropTypes.object
 },

  getDefaultProps() {
    return {
      margins: {top: 10, right: 20, bottom: 40, left: 45},
      yAxisTickCount: 4,
      className: 'rd3-areachart'
    };
  },

  render() {

    var props = this.props;

    // Calculate inner chart dimensions
    var innerWidth, innerHeight;
    innerWidth = props.width - props.margins.left - props.margins.right;
    innerHeight = props.height - props.margins.top - props.margins.bottom;

    if (props.legend) {
      innerWidth = innerWidth - props.legendOffset;
    }

    if (!Array.isArray(props.data)) {
      props.data = [props.data];
    }
    var yScale = d3.scale.linear()
      .range([innerHeight, 0]);

    var xValues = [];
    var yValues = [];
    props.data.forEach( function(series)  {
      series.values.forEach(function(val, idx)  {
        xValues.push(props.xAccessor(val));
      });
    });

    var xScale;
    if (xValues.length > 0 && Object.prototype.toString.call(xValues[0]) === '[object Date]' && props.xAxisTickInterval) {
      xScale = d3.time.scale()
        .range([0, innerWidth]);
    } else {
      xScale = d3.scale.linear()
        .range([0, innerWidth]);
    }
    xScale.domain(d3.extent(xValues));

    var stack = d3.layout.stack()
      .x(props.xAccessor)
      .y(props.yAccessor)
      .order('reverse')
      .values(function(d) { return d.values; });

    var layers = stack(props.data);

    var seriesNames = [];
    layers.forEach(function(layer) {
      seriesNames.push(layer.name);
    });

    props.colors.domain(seriesNames);

    var ySummed = [];
    layers[0].values.forEach(function(value, idx) {
      var sum = 0;
      var sum = layers.reduce(function(a,b) {
        return a += b.values[idx].y;
      }, 0);
      ySummed.push(sum);
    });
    yScale.domain([0,d3.max(ySummed)]);

    var trans = `translate(${ props.margins.left },${ props.margins.top })`;

    var dataSeries = layers.map( (d, idx) => {
      return (
          <DataSeries
            key={idx}
            name={d.name}
            colors={props.colors}
            index={idx}
            xScale={xScale}
            yScale={yScale}
            data={d.values}
            xAccessor={props.xAccessor}
            yAccessor={(d) => d.y}
          />
        );
      });

    return (
      <Chart
        viewBox={props.viewBox}
        legend={props.legend}
        data={props.data}
        margins={props.margins}
        colors={props.colors}
        width={props.width}
        height={props.height}
        title={props.title}
      >
        <g transform={trans} className={props.className}>
          {dataSeries}
          <XAxis
            xAxisClassName='rd3-areachart-xaxis'
            xScale={xScale}
            xAxisTickInterval={props.xAxisTickInterval}
            xAxisTickCount={props.xAxisTickCount}
            xAxisLabel={props.xAxisLabel}
            xAxisLabelOffset={props.xAxisLabelOffset}
            xOrient={props.xOrient}
            margins={props.margins}
            width={innerWidth}
            height={innerHeight}
          />
          <YAxis
            yAxisClassName='rd3-areachart-yaxis'
            yScale={yScale}
            yAxisTickInterval={props.yAxisTickInterval}
            yAxisTickCount={props.yAxisTickCount}
            yAxisLabel={props.yAxisLabel}
            yAxisLabelOffset={props.yAxisLabelOffset}
            yOrient={props.yOrient}
            margins={props.margins}
            width={innerWidth}
            height={props.height}
          />
        </g>
      </Chart>
    );
  }

});
