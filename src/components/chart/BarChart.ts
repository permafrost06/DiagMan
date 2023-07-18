import * as d3 from "d3";

export interface BarChartData {
    label: string;
    values: number[];
}

interface SizeRect {
    height: number;
    width: number;
}

interface LegendProps {
    fontSize: number;
    gap: {
        x: number;
        y: number;
    };
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}

export interface Level {
    count?: number;
    unit?: string;
}

interface Legend {
    label: string;
    color: string;
}

interface PreparedLegend {
    legends?: Legend[];
    block?: {
        height: number;
        width: number;
    };
}

const COLORS = [
    "#E74C3C",
    "#3498DB",
    "#2ECC71",
    "#9B59B6",
    "#1ABC9C",
    "#F1C40F",
    "#E67E22",
    "#34495E",
    "#95A5A6",
    "#D35400",
];

const MARGINS = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
};

export class BarChart {
    protected svg: Element;
    protected d3El: d3.Selection<Element, unknown, null, undefined>;
    protected height: number;
    protected width: number;

    protected xScale: any;
    protected yScale: any;

    protected legendColors: string[] = [];
    protected legends: string[] = [];
    protected level: Required<Level>;

    //TODO: Figure a way out to make this things dynamic
    protected xAxisHeight = 20;
    protected yAxisWidth = 30;
    protected topSpace = 10;
    protected rightSpace = 10;

    protected legendOpts: LegendProps = {
        fontSize: 14,
        gap: {
            x: 0,
            y: 15,
        },
        margins: {
            top: 10,
            left: 0,
            bottom: 10,
            right: 0,
        },
    };

    constructor(svg: Element) {
        this.svg = svg;
        this.d3El = d3.select(svg);
        (this.height = 0), (this.width = 0);
        this.level = {
            count: 5,
            unit: "",
        };
    }

    public resize(newHeight: number, newWidth: number): BarChart {
        this.height = newHeight - MARGINS.top - MARGINS.bottom;
        this.width = newWidth - MARGINS.left - MARGINS.right;
        this.d3El.attr("height", this.height).attr("width", this.width);
        return this;
    }

    public draw(bars: BarChartData[]) {
        this.svg.innerHTML = "";
        let remHeight = this.height,
            remWidth = this.width;
        const legendSize = this.drawLegends(remHeight, remWidth);
        remHeight -= legendSize.height;

        //this.drawAxes(remHeight, remWidth, bars);

        remWidth -= this.yAxisWidth;
        remHeight -= this.xAxisHeight;

        const dataLayer = this.d3El
            .append("g")
            .attr(
                "transform",
                `translate(${this.width - remWidth}, ${this.topSpace})`
            )
            .attr("class", "data-layer");
    }

    protected drawAxes(
        remHeight: number,
        remWidth: number,
        bars: BarChartData[]
    ) {
        const yAxis = d3.axisLeft(this.yScale).ticks(this.level.count);

        const yLayer = this.d3El
            .append("g")
            .attr("class", "axis y-axis")
            .call(yAxis)
            .attr(
                "transform",
                `translate(${this.width - remWidth}, ${this.topSpace})`
            );

        yLayer.select(".tick line").remove();
        yLayer
            .selectAll(".tick line")
            .attr("class", "y-level")
            .attr("x1", 0)
            .attr("x2", remWidth);
    }

    public setLegends(legends: string[]): BarChart {
        this.legends = legends;
        return this;
    }

    protected prepareLegends(remWidth: number): PreparedLegend {
        const legends: Legend[] = [];

        const maxLegends = Math.min(this.legends.length, COLORS.length);

        if (maxLegends === 0) {
            return {};
        }

        // Get the maximum size of the legends to determine block size
        let maxCharLength = 0;
        for (let i = 0; i < maxLegends; i++) {
            legends.push({
                label: this.legends[i],
                color: COLORS[i],
            });
            maxCharLength = Math.max(maxCharLength, this.legends[i].length);
        }

        const maxW =
            maxCharLength * this.legendOpts.fontSize + this.legendOpts.gap.x;
        let blockW = maxW;

        if (maxW >= remWidth) {
            blockW = remWidth;
        }
        const blockH =
            Math.ceil(
                ((maxCharLength + 2) * this.legendOpts.fontSize) / blockW
            ) + this.legendOpts.gap.y;

        return {
            legends,
            block: {
                height: blockH,
                width: blockW,
            },
        };
    }

    protected drawLegends(remHeight: number, remWidth: number): SizeRect {
        const { legends, block } = this.prepareLegends(remWidth);
        if (!legends || !block) {
            return { height: 0, width: 0 };
        }

        const cols = Math.floor(remWidth / block.width);

        // Create the legend group element
        const legend = this.d3El.append("g").attr("class", "legend");

        // Append rectangles and text to represent each item in the legend
        const legendItems = legend
            .selectAll(".legend-item")
            .data(legends)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (_d, i) => {
                const top = Math.floor(i / cols) * block.height;
                const left = (i % cols) * block.width;
                return `translate(${left}, ${top})`;
            });

        legendItems
            .append("rect")
            .attr("x", this.legendOpts.gap.x / 2)
            .attr("y", this.legendOpts.gap.y / 2)
            .attr("width", this.legendOpts.fontSize)
            .attr("height", this.legendOpts.fontSize)
            .attr("fill", (d) => d.color);

        legendItems
            .append("text")
            .attr("x", this.legendOpts.fontSize * 1.3)
            .attr("y", this.legendOpts.gap.y / 2)
            .attr("dy", this.legendOpts.fontSize * 0.85)
            .attr("font-size", this.legendOpts.fontSize)
            .text(function (d) {
                return d.label;
            });

        const bbox = legend.node()?.getBBox();

        if (bbox) {
            legend.attr(
                "transform",
                `translate(${(remWidth - bbox.width) / 2}, ${
                    remHeight - bbox.height - this.legendOpts.margins.bottom
                })`
            );
        }

        return { width: bbox?.width || 0, height: bbox?.height || 0 };
    }

    public handleMouseOver(element: any, d: any, remWidth: number) {
        d3.select(element).attr("r", 3);

        const label = `X: ${d.x.toFixed(2)}, Value: ${d.y.toFixed(2)}`;
        const labelGroup = this.d3El
            .append("g")
            .attr("class", "data-label-group");
        const hText = 20;
        const wText = 5 * (label.length + 2);

        let xPos = this.xScale(d.x) + this.width - remWidth;
        let yPos = this.yScale(d.y) + this.topSpace;

        if (xPos + wText > this.width) {
            xPos = xPos - wText - 10;
        }
        if (yPos - hText - 23 < 0) {
            yPos += hText;
        }
        labelGroup
            .append("rect")
            .attr("class", "data-label-bg")
            .attr("x", xPos)
            .attr("y", yPos - 23)
            .attr("width", wText)
            .attr("height", hText)
            .attr("rx", 5) // Set the border radius
            .attr("ry", 5);

        labelGroup
            .append("text")
            .attr("class", "data-label")
            .attr("x", xPos + 11)
            .attr("y", yPos - 10)
            .text(label)
            .style("font-size", "10px")
            .style("fill", "currentColor");
    }

    // Function to handle mouseout event
    public handleMouseOut(element: any) {
        d3.select(element).attr("r", 2.5);

        this.d3El.selectAll(".data-label-group").remove();
    }
}

export const initBarChart = (svg: Element): BarChart => {
    return new BarChart(svg);
};
