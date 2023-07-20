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
    "#000000",
    "#9371f0",
    "#39dbff",
    "#3f54ec",
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

    protected yScale: any;

    protected legendColors: string[] = [];
    protected legends: string[] = [];
    protected level: Required<Level>;

    protected barWidth = 20;
    protected barGap = 30;

    //TODO: Figure a way out to make this things dynamic
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

        let maxYval = 0;
        bars.forEach((bar) => {
            if (bar.values.length === 0) {
                return;
            }
            bar.values = bar.values.sort((a, b) => a - b);
            maxYval = Math.max(maxYval, bar.values[bar.values.length - 1]);
        });

        this.yScale = d3
            .scaleLinear()
            .domain([0, maxYval])
            .range([remHeight - this.topSpace, 0]);

        this.drawYAxis(remHeight, remWidth);
        remWidth -= this.yAxisWidth;

        const dataLayer = this.d3El
            .append("g")
            .attr("transform", `translate(${this.width - remWidth}, 0)`)
            .attr("class", "data-layer");

        const maxH = this.yScale(0);
        bars.forEach((bar, i) => {
            if (bar.values.length === 0) {
                return;
            }
            const barG = dataLayer
                .append("g")
                .attr(
                    "transform",
                    `translate(${
                        this.barWidth * i + this.barGap * (i + 1)
                    }, ${remHeight})`
                );
            let lastH = 0;
            bar.values.forEach((val, j) => {
                const h = maxH - this.yScale(val);
                barG.append("rect")
                    .attr("x", 0)
                    .attr("y", -h)
                    .attr("width", this.barWidth)
                    .attr("height", h - lastH)
                    .attr("fill", COLORS[j]);
                lastH = h;
            });
        });
    }

    protected drawYAxis(remHeight: number, remWidth: number) {
        const yAxis = d3.axisLeft(this.yScale).ticks(this.level.count);

        const yLayer = this.d3El
            .append("g")
            .attr("class", "axis y-axis")
            .call(yAxis)
            .attr(
                "transform",
                `translate(${this.width - remWidth + this.yAxisWidth}, ${
                    this.topSpace
                })`
            );
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
        let height = 0;
        const width = 0;
        const { legends, block } = this.prepareLegends(remWidth);
        if (!legends || !block) {
            return { height, width };
        }

        height += this.legendOpts.margins.top + this.legendOpts.margins.bottom;

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
            height += bbox.height;
        }

        return { height, width };
    }
}

export const initBarChart = (svg: Element): BarChart => {
    return new BarChart(svg);
};
