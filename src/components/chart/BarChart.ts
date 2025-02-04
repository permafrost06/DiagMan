import { formatNumber } from "@/helpers/utils";
import * as d3 from "d3";

export interface BarChartData {
    labels: string[];
    keys: { key: string; label: string; color: string }[];
    values: { [key: string]: number }[];
}

const PADDING = { top: 0, right: 0, bottom: 30, left: 0 };
const LEGEND_COLOR_SIZE = 14;
const LEGEND_TEXT_SPACING = 10;
const LEGEND_VERTICAL_SPACING = 20;
const LEGEND_X_SPACING = 20;
const CHART_LEGEND_GAP = 10;

export class BarChart {
    protected svg: Element;
    protected d3El: d3.Selection<Element, unknown, null, undefined>;
    protected height: number;
    protected width: number;
    protected yScale: any;
    protected xScale: any;
    protected legends: { key: string; label: string; color: string }[] = [];
    protected yAxisWidth = 40;
    protected legendHeight = 0;

    constructor(svg: Element) {
        this.svg = svg;
        this.d3El = d3.select(svg);
        this.height = 0;
        this.width = 0;
    }

    public resize(newHeight: number, newWidth: number): BarChart {
        this.height = newHeight - PADDING.top - PADDING.bottom;
        this.width = newWidth - PADDING.left - PADDING.right;
        this.d3El.attr("height", newHeight).attr("width", newWidth);
        return this;
    }

    public draw(data: BarChartData) {
        this.svg.innerHTML = "";
        this.legends = data.keys;

        this.legendHeight = this.drawLegends();
        const remHeight = this.height - this.legendHeight - CHART_LEGEND_GAP;
        let remWidth = this.width;

        const maxYval =
            d3.max(data.values, (d) => d3.sum(Object.values(d))) || 0;
        const maxYvalAdjusted = maxYval * 1.2;

        this.yScale = d3
            .scaleLinear()
            .domain([0, maxYvalAdjusted])
            .range([remHeight, 0]);

        this.yAxisWidth = this.calculateYAxisWidth();
        remWidth -= this.yAxisWidth;

        this.xScale = d3
            .scaleBand()
            .domain(data.labels)
            .range([0, remWidth])
            .padding(0.2);

        this.drawYAxis(remWidth);

        const dataLayer = this.d3El
            .append("g")
            .attr(
                "transform",
                `translate(${PADDING.left + this.yAxisWidth}, ${
                    this.legendHeight + CHART_LEGEND_GAP
                })`,
            )
            .attr("class", "data-layer");

        const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "#333")
            .style("color", "#fff")
            .style("padding", "5px 10px")
            .style("border-radius", "5px")
            .style("font-size", "12px")
            .style("visibility", "hidden")
            .style("pointer-events", "none");

        data.values.forEach((bar, index) => {
            const barG = dataLayer
                .append("g")
                .attr(
                    "transform",
                    `translate(${this.xScale(data.labels[index])}, 0)`,
                );

            let cumulativeHeight = this.yScale(0);

            data.keys.forEach((entry) => {
                const key = entry.key;
                const barHeight = this.yScale(0) - this.yScale(bar[key]);
                const barWidth = Math.min(this.xScale.bandwidth(), 10);
                const barX = (this.xScale.bandwidth() - barWidth) / 2;

                barG.append("rect")
                    .attr("x", barX)
                    .attr("y", cumulativeHeight - barHeight)
                    .attr("width", barWidth)
                    .attr("height", barHeight)
                    .attr("fill", entry.color)
                    .on("mouseover", () => {
                        const total = d3.sum(
                            data.keys.map((entry) => bar[entry.key] || 0),
                        );
                        const tooltipContent =
                            data.keys
                                .map(
                                    (entry) =>
                                        `${entry.label}: ${formatNumber(bar[entry.key] || 0)}/-`,
                                )
                                .join("<br>") +
                            `<br><strong>Total: ${formatNumber(total)}/-</strong>`;

                        tooltip
                            .style("visibility", "visible")
                            .html(tooltipContent);
                    })

                    .on("mousemove", (event) => {
                        tooltip
                            .style("top", `${event.pageY - 30}px`)
                            .style("left", `${event.pageX + 10}px`);
                    })
                    .on("mouseout", () => {
                        tooltip.style("visibility", "hidden");
                    });

                cumulativeHeight -= barHeight;
            });
        });

        this.drawXAxis(remHeight);
    }

    protected calculateYAxisWidth(): number {
        const maxYAxisVal = Math.max(...this.yScale.ticks(5));
        return getTextWidth(formatNumber(maxYAxisVal), "12px Arial");
    }

    protected drawYAxis(remWidth: number) {
        const yAxis = d3
            .axisLeft(this.yScale)
            .ticks(5)
            .tickFormat(formatNumber as any);

        const yAxisGroup = this.d3El
            .append("g")
            .attr("class", "y-axis")
            .attr(
                "transform",
                `translate(${PADDING.left + this.yAxisWidth}, ${
                    this.legendHeight + CHART_LEGEND_GAP
                })`,
            );

        yAxisGroup.call(yAxis);
        yAxisGroup.select(".domain").remove();
        yAxisGroup
            .selectAll(".tick line")
            .attr("x1", 0)
            .attr("x2", remWidth)
            .attr("stroke-dasharray", "4,4");
    }

    protected drawXAxis(remHeight: number) {
        const xAxis = d3
            .axisBottom(this.xScale)
            .tickValues(
                this.xScale.domain().filter((_: any, i: number) => i % 5 === 0),
            );

        this.d3El
            .append("g")
            .attr("class", "x-axis")
            .attr(
                "transform",
                `translate(${PADDING.left + this.yAxisWidth}, ${
                    remHeight + this.legendHeight + CHART_LEGEND_GAP
                })`,
            )
            .call(xAxis)
            .selectAll("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "#666");
    }

    protected drawLegends(): number {
        const legendGroup = this.d3El
            .append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${PADDING.left}, 0)`);

        const longestLabel =
            d3.max(this.legends, (d) => getTextWidth(d.label, "12px Arial")) ||
            0;
        const colSize =
            longestLabel +
            LEGEND_COLOR_SIZE +
            LEGEND_TEXT_SPACING +
            LEGEND_X_SPACING;

        const maxCols = Math.floor(this.width / colSize);
        const numCols = Math.min(this.legends.length, maxCols);
        const numRows = Math.ceil(this.legends.length / numCols);

        legendGroup
            .selectAll(".legend-item")
            .data(this.legends)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (_d, i) => {
                const col = i % numCols;
                const row = Math.floor(i / numCols);
                return `translate(${col * colSize}, ${
                    row * LEGEND_VERTICAL_SPACING
                })`;
            })
            .each(function (d) {
                const legend = d3.select(this);
                legend
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", LEGEND_COLOR_SIZE)
                    .attr("height", LEGEND_COLOR_SIZE)
                    .attr("fill", d.color);

                legend
                    .append("text")
                    .attr("x", LEGEND_COLOR_SIZE + LEGEND_TEXT_SPACING)
                    .attr("y", LEGEND_COLOR_SIZE - 2)
                    .attr("font-size", 12)
                    .text(d.label);
            });

        return numRows * LEGEND_VERTICAL_SPACING;
    }
}

function getTextWidth(text: string, font: string) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return 0;
    context.font = font;
    return context.measureText(text).width;
}

export const initBarChart = (svg: Element): BarChart => {
    return new BarChart(svg);
};
