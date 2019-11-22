import merge from "lodash/merge";
import { computed } from "mobx";
import { observer } from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import {
  combineContainerMixins,
  cursorContainerMixin,
  LineSegment,
  VictoryAxis,
  VictoryContainer,
  VictoryTheme,
  VictoryTooltip,
  voronoiContainerMixin,
  zoomContainerMixin
} from "victory";
import Chart from "./Chart";

@observer
class BottomDockChart extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    chartItems: PropTypes.array.isRequired,
    xAxis: PropTypes.object.isRequired
  };

  @computed
  get theme() {
    const fontSize = 10;
    return merge({}, VictoryTheme.grayscale, {
      chart: { padding: { top: 30, bottom: 30, left: 50, right: 50 } },
      axis: {
        // Default theme applies to both x & y axes.
        style: {
          axis: {
            stroke: "white"
          },
          axisLabel: {
            fill: "white",
            padding: -15
          },
          grid: {
            stroke: "white",
            strokeWidth: "1px",
            opacity: 0.086
          },
          ticks: {
            stroke: "white",
            size: 5
          },
          tickLabels: {
            fill: "white",
            fontSize,
            padding: 1
          }
        }
      }
    });
  }

  /**
   * Compute a single domain for all chartItems.
   */
  @computed
  get domain() {
    const chartItems = this.props.chartItems;
    const xmin = Math.min(...chartItems.map(c => c.domain.x[0]));
    const xmax = Math.max(...chartItems.map(c => c.domain.x[1]));
    const ymin = Math.min(...chartItems.map(c => c.domain.y[0]));
    const ymax = Math.max(...chartItems.map(c => c.domain.y[1]));
    return {
      x: [xmin, xmax],
      y: [ymin, ymax]
    };
  }

  /**
   * Returns a container component configured with the required mixins.
   */
  @computed
  get containerComponent() {
    const mixins = [
      //voronoiContainerMixin,
      zoomContainerMixin
      //cursorContainerMixin -- TODO: breaks eventHandlers used for moment charts
    ];
    const Container = combineContainerMixins(mixins, VictoryContainer);

    const getTooltipValue = ({ datum }) => {
      const tooltipValue = datum.tooltipValue || datum.y;
      const units = datum.units || "";
      return `${datum.name}: ${tooltipValue} ${units}`;
    };

    return (
      <Container
        zoomDimension="x"
        zoomDomain={this.domain}
        cursorDimension="x"
        cursorComponent={
          <LineSegment style={{ stroke: "white", opacity: "0.5" }} />
        }
        labels={getTooltipValue}
        labelComponent={<VictoryTooltip cornerRadius={0} />}
      />
    );
  }

  renderYAxis({ units, color }, i, yAxisCount) {
    const tickCount = Math.min(8, Math.round(this.props.height / 30));
    // If this is the only yAxis, then color it white
    const axisColor = yAxisCount === 1 ? "white" : color;
    return (
      <VictoryAxis
        dependentAxis
        key={i}
        offsetX={50 + i * 50}
        label={units}
        tickCount={tickCount}
        style={{
          axis: { stroke: axisColor },
          axisLabel: { fill: axisColor },
          ticks: { stroke: axisColor },
          tickLabels: { fill: axisColor }
        }}
      />
    );
  }

  render() {
    const chartItems = sortChartItemsByType(this.props.chartItems);
    return (
      <Chart
        width={this.props.width}
        height={this.props.height}
        chartItems={chartItems}
        xAxis={this.props.xAxis}
        theme={this.theme}
        containerComponent={this.containerComponent}
        renderYAxis={this.renderYAxis.bind(this)}
      />
    );
  }
}

/**
 * Sorts chartItems so that `momentPoints` are rendered on top then
 * `momentLines` and then any other types.
 * @param {ChartItem[]} chartItems array of chartItems to sort
 */
function sortChartItemsByType(chartItems) {
  const order = ["momentLines", "momentPoints"];
  return chartItems.slice().sort((a, b) => {
    return order.indexOf(a.type) - order.indexOf(b.type);
  });
}

export default BottomDockChart;
