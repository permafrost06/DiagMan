import * as d3 from "d3";

export interface DonutChartItem {
    label: string;
    value: number;
    color: string;
}

export type DonutChartData = DonutChartItem[];

const PADDING = { top: 10, right: 10, bottom: 10, left: 10 };
const LEGEND_BOX_SIZE = 14;
const LEGEND_BOX_GAP = 10;
const LEGEND_SPACING = 30;
const CHART_LEGEND_GAP = 40;
const DONUT_ITEM_GAP = 2;
const BORDER_RADIUS = 5;
const FONT_SIZE = "12px";
const FONT_FAMILY = "Arial";

function getTextWidth(
    text: string,
    font: string = `${FONT_SIZE} ${FONT_FAMILY}`
): number {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return 0;
    context.font = font;
    return context.measureText(text).width;
}

export class DonutChart {
    protected svg: Element;
    protected d3El: d3.Selection<Element, unknown, null, undefined>;
    protected width: number;
    protected height: number;

    constructor(svg: Element) {
        this.svg = svg;
        this.d3El = d3.select(svg);
        this.height = 0;
        this.width = 0;
    }

    public resize(newHeight: number, newWidth: number): DonutChart {
        this.height = newHeight - PADDING.top - PADDING.bottom;
        this.width = newWidth - PADDING.left - PADDING.right;
        this.d3El.attr("height", newHeight).attr("width", newWidth);
        return this;
    }

    public draw(data: DonutChartData): void {
        this.svg.innerHTML = "";

        const availableWidth = this.width - PADDING.left - PADDING.right;
        const availableHeight = this.height - PADDING.top - PADDING.bottom;
        const colSizeMax = availableWidth / 2 - CHART_LEGEND_GAP / 2;
        const maxTextWidth = Math.max(
            ...data.map((d) => getTextWidth(d.label))
        );
        const legendWidth = Math.min(
            maxTextWidth + LEGEND_BOX_SIZE + LEGEND_BOX_GAP,
            colSizeMax
        );

        const radius = Math.min(colSizeMax / 2, availableHeight / 2);

        const chartX = PADDING.left + colSizeMax + CHART_LEGEND_GAP + radius;
        const chartY = PADDING.top + availableHeight / 2;

        const pie = d3
            .pie<DonutChartItem>()
            .value((d) => d.value)
            .padAngle(DONUT_ITEM_GAP / 100);

        const arc = d3
            .arc<d3.PieArcDatum<DonutChartItem>>()
            .innerRadius(radius * 0.6)
            .outerRadius(radius)
            .cornerRadius(BORDER_RADIUS);

        const g = this.d3El
            .append("g")
            .attr("transform", `translate(${chartX},${chartY})`);

        g.selectAll("path")
            .data(pie(data))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", (d) => d.data.color);

        g.selectAll("text")
            .data(pie(data))
            .enter()
            .append("text")
            .attr("transform", (d) => `translate(${arc.centroid(d)})`)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .style("fill", "white")
            .style("font-size", "14px")
            .text((d) => `${d.data.value}%`);

        this.drawLegend(data, legendWidth, availableHeight);
    }

    protected drawLegend(
        data: DonutChartData,
        legendWidth: number,
        availableHeight: number
    ): void {
        const totalLegendHeight = data.length * LEGEND_SPACING;

        const legendY = PADDING.top + (availableHeight - totalLegendHeight) / 2;

        const legend = this.d3El
            .append("g")
            .attr("transform", `translate(${PADDING.left}, ${legendY})`);

        data.forEach((d, i) => {
            const legendRow = legend
                .append("g")
                .attr("transform", `translate(0, ${i * LEGEND_SPACING})`);

            legendRow
                .append("rect")
                .attr("width", LEGEND_BOX_SIZE)
                .attr("height", LEGEND_BOX_SIZE)
                .attr("fill", d.color);

            const textElement = legendRow
                .append("text")
                .attr("x", LEGEND_BOX_SIZE + LEGEND_BOX_GAP)
                .attr("y", LEGEND_BOX_SIZE - 2)
                .style("font-size", FONT_SIZE)
                .style("fill", "black")
                .text(d.label);

            const textWidth = getTextWidth(d.label);
            if (textWidth > legendWidth - LEGEND_BOX_SIZE - LEGEND_BOX_GAP) {
                this.wrapText(
                    textElement,
                    d.label,
                    legendWidth - LEGEND_BOX_SIZE - LEGEND_BOX_GAP
                );
            }
        });
    }

    private wrapText(
        textElement: d3.Selection<SVGTextElement, unknown, null, undefined>,
        text: string,
        width: number
    ): void {
        const words = text.split(" ");
        let line = "";
        const lines: string[] = [];
        words.forEach((word) => {
            const testLine = line + (line.length > 0 ? " " : "") + word;
            if (getTextWidth(testLine) > width) {
                lines.push(line);
                line = word;
            } else {
                line = testLine;
            }
        });
        lines.push(line);

        textElement.text(null);
        lines.forEach((line, i) => {
            textElement
                .append("tspan")
                .attr("x", LEGEND_BOX_SIZE + LEGEND_BOX_GAP)
                .attr("dy", i === 0 ? "0em" : "1.2em")
                .text(line);
        });
    }
}

export const initDonutChart = (svg: Element): DonutChart => {
    return new DonutChart(svg);
};
