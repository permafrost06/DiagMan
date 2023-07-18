import * as d3 from "d3";

export interface DataPoint {
    x: number;
    y: number;
}

export interface LabelType {
    x?: string;
    y?: string;
}

interface SizeRect {
    height: number;
    width: number;
}

export interface Level {
    count: number;
    unit: string;
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

interface Levels {
    x: Level;
    y: Level;
}
interface LevelArgs {
    x?: Level | number;
    y?: Level | number;
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

export class LineChart {
    protected svg: Element;
    protected d3El: d3.Selection<Element, unknown, null, undefined>;
    protected height: number;
    protected width: number;
    protected labels: Required<LabelType>;
    protected levels: Required<Levels>;

    protected xScale: any;
    protected yScale: any;

    protected legendColors: string[] = [];
    protected legends: string[] = [];

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

        this.labels = {
            x: "",
            y: "",
        };

        this.levels = {
            x: {
                unit: "",
                count: 10,
            },
            y: {
                unit: "",
                count: 5,
            },
        };
    }

    public resize(newHeight: number, newWidth: number): LineChart {
        this.height = newHeight - MARGINS.top - MARGINS.bottom;
        this.width = newWidth - MARGINS.left - MARGINS.right;
        this.d3El.attr("height", this.height).attr("width", this.width);
        return this;
    }

    public draw(dataGroups: DataPoint[][]) {
        this.svg.innerHTML = "";
        let remHeight = this.height,
            remWidth = this.width;
        const legendSize = this.drawLegends(remHeight, remWidth);
        remHeight -= legendSize.height;
        const axesLabelSize = this.drawAxesLabel(remHeight, remWidth);

        remHeight -= axesLabelSize.height;
        remWidth -= axesLabelSize.width;

        const range = {
            x: [0, 0],
            y: [0, 0],
        };

        /**
         * This could be achieved using `d3.extent` but that would
         * take a round trip for each x and y.
         */
        dataGroups.forEach((dataset) => {
            dataset.forEach((data) => {
                range.x[0] = Math.min(range.x[0], data.x);
                range.x[1] = Math.max(range.x[1], data.x);

                range.y[0] = Math.min(range.y[0], data.y);
                range.y[1] = Math.max(range.y[1], data.y);
            });
        });

        remWidth -= this.yAxisWidth;
        remHeight -= this.xAxisHeight;

        this.xScale = d3
            .scaleLinear()
            .domain(range.x)
            .range([0, remWidth - this.rightSpace]);
        this.yScale = d3
            .scaleLinear()
            .domain(range.y)
            .range([remHeight - this.topSpace, 0]);

        this.drawAxes(remHeight, remWidth);

        const line = d3
            .line()
            .x((d: any) => this.xScale(d.x))
            .y((d: any) => this.yScale(d.y))
            .curve(d3.curveLinear);

        const dataLayer = this.d3El
            .append("g")
            .attr(
                "transform",
                `translate(${this.width - remWidth}, ${this.topSpace})`
            )
            .attr("class", "data-layer");

        const lineLayer = dataLayer.append("g").attr("class", "lines-layer");
        const pointsLayer = dataLayer.append("g").attr("class", "points-layer");

        const instance = this;

        this.legendColors = [];

        dataGroups.forEach((data, i) => {
            this.legendColors.push(COLORS[i]);
            const grad = this.initGradient(COLORS[i] + "55");
            lineLayer
                .selectAll(".line")
                .data([data])
                .join("path")
                .attr("d", (d: any) => line(d))
                .attr("fill", `url(${grad})`)
                .attr("stroke", COLORS[i]);

            pointsLayer
                .append("g")
                .selectAll(".data-point")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "data-point")
                .attr("cx", (d: any) => this.xScale(d.x))
                .attr("cy", (d: any) => this.yScale(d.y))
                .attr("r", 2.5)
                .attr("fill", COLORS[i])
                .style("cursor", "pointer")
                .on("mouseover", function (this: any, _evt, d) {
                    instance.handleMouseOver(this, d, remWidth);
                })
                .on("mouseout", function (this: any) {
                    instance.handleMouseOut(this);
                });
        });
    }

    public setLevels(levels: LevelArgs): LineChart {
        if (typeof levels.x === "number") {
            levels.x = {
                count: levels.x,
                unit: "",
            };
        }

        if (typeof levels.y === "number") {
            levels.y = {
                count: levels.y,
                unit: "",
            };
        }
        //@ts-expect-error tada
        this.levels = { ...this.levels, ...levels };
        return this;
    }

    protected drawAxes(remHeight: number, remWidth: number) {
        const xAxis = d3
            .axisBottom(this.xScale)
            .ticks(this.levels.x.count)
            .tickFormat((i: any) => i + 1);
        const xLayer = this.d3El
            .append("g")
            .attr("class", "axis x-axis")
            .call(xAxis)
            .attr(
                "transform",
                `translate(${this.width - remWidth}, ${remHeight})`
            );

        xLayer.select(".tick line").remove();
        xLayer
            .selectAll(".tick line")
            .attr("class", "x-level")
            .attr("y1", 0)
            .attr("y2", -remHeight);

        const yAxis = d3.axisLeft(this.yScale).ticks(this.levels.y.count);

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

    public setLegends(legends: string[]): LineChart {
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

    public setLabels(labels: LabelType): LineChart {
        this.labels = { ...this.labels, ...labels };
        return this;
    }

    protected drawAxesLabel(remHeight: number, remWidth: number): SizeRect {
        const size: SizeRect = {
            height: 0,
            width: 0,
        };

        const labelsGroup = this.d3El
            .append("g")
            .attr("class", "axis-labels")
            .attr("transform", "translate(0, 0)");

        if (this.labels.x) {
            const label = labelsGroup
                .append("text")
                .attr("class", "x-axis-label")
                .attr("x", remWidth / 2)
                .attr("text-anchor", "middle")
                .attr("fill", "currentColor")
                .text(this.labels.x);
            const bbox = label.node()?.getBBox();
            if (bbox) {
                label.attr("y", remHeight - bbox.height);
                size.height = bbox.height + 10;
            }
        }

        if (this.labels.y) {
            const label = labelsGroup
                .append("text")
                .attr("class", "y-axis-label")
                .attr("x", -remHeight / 2)
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("fill", "currentColor")
                .text(this.labels.y);
            const bbox = label.node()?.getBBox();
            if (bbox) {
                label.attr("y", bbox.height);
                size.width = bbox.height;
            }
        }

        return size;
    }

    protected initGradient(colorCode: string): string {
        const id = `gradient-${colorCode.substring(1)}`;
        const lg = this.d3El
            .append("defs")
            .append("linearGradient")
            .attr("id", id) //id of the gradient
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "100%")
            .attr("y2", "0%"); //since its a vertical linear gradient
        lg.append("stop")
            .attr("offset", "0%")
            .style("stop-color", colorCode) //end in red
            .style("stop-opacity", 0);

        lg.append("stop")
            .attr("offset", "100%")
            .style("stop-color", colorCode) //start in blue
            .style("stop-opacity", 1);
        return id;
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

export const initLineChart = (svg: Element): LineChart => {
    return new LineChart(svg);
};
