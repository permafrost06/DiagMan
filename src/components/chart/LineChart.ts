import * as d3 from "d3";

export interface DataPoint {
    x: number;
    y: number;
}

export interface LabelType {
    x?: string;
    y?: string;
}

export interface Level {
    count: number;
    unit: string;
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
    "E74C3C",
    "3498DB",
    "2ECC71",
    "9B59B6",
    "1ABC9C",
    "F1C40F",
    "E67E22",
    "34495E",
    "95A5A6",
    "D35400",
];

const MARGINS = {
    top: 20,
    right: 20,
    bottom: 40,
    left: 40,
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

    public setLabels(labels: LabelType): LineChart {
        this.labels = { ...this.labels, ...labels };
        return this;
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

    public resize(newHeight: number, newWidth: number): LineChart {
        this.height = newHeight - MARGINS.top - MARGINS.bottom;
        this.width = newWidth - MARGINS.left - MARGINS.right;
        this.d3El
            .attr("height", this.height)
            .attr("width", this.width)
            .style(
                "margin",
                `${MARGINS.top}px ${MARGINS.right}px ${MARGINS.bottom}px ${MARGINS.left}px`
            );
        return this;
    }

    public draw(dataGroups: DataPoint[][]) {
        let maxYVal = 0;
        let maxXVal = 0;
        this.svg.innerHTML = "";

        dataGroups.forEach((dataset) => {
            dataset.forEach((data) => {
                if (data.y > maxYVal) {
                    maxYVal = data.y;
                }
            });
            if (dataset[0] && dataset[0].y > 0) {
                dataset.unshift({
                    x: 0,
                    y: 0,
                });
            }

            if (dataset.length > 0) {
                const last = dataset[dataset.length - 1];
                if (last.y > 0) {
                    dataset.push({
                        x: last.x,
                        y: 0,
                    });
                }
            }

            if (maxXVal < dataset.length - 1) {
                maxXVal = dataset.length - 1;
            }
        });

        this.xScale = d3
            .scaleLinear()
            .domain([0, maxXVal])
            .range([0, this.width]);
        this.yScale = d3
            .scaleLinear()
            .domain([0, maxYVal])
            .range([this.height, 0]);

        //this.drawLevels();
        const line = d3
            .line()
            .x((d: any) => this.xScale(d.x))
            .y((d: any) => this.yScale(d.y))
            .curve(d3.curveLinear);

        this.drawAxes();

        const lineLayer = this.d3El.append("g");
        const pointsLayer = this.d3El.append("g");

        const instance = this;

        dataGroups.forEach((data, i) => {
            const color = "#" + COLORS[i];
            const grad = this.initGradient(COLORS[i] + "55");
            lineLayer
                .selectAll(".line")
                .data([data])
                .join("path")
                .attr("d", (d: any) => line(d))
                .attr("fill", `url(#${grad})`)
                .attr("stroke", color);

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
                .attr("fill", color)
                .style("cursor", "pointer")
                .on("mouseover", function (this: any, _evt, d) {
                    instance.handleMouseOver(this, d);
                })
                .on("mouseout", function (this: any) {
                    instance.handleMouseOut(this);
                });
        });

        this.drawAxesLabels();
    }

    protected drawAxes() {
        const xAxis = d3
            .axisBottom(this.xScale)
            .ticks(this.levels.x.count)
            .tickFormat((i: any) => i + 1);
        const yAxis = d3.axisLeft(this.yScale).ticks(this.levels.y.count);

        const xLayer = this.d3El
            .append("g")
            .attr("class", "axis x-axis")
            .call(xAxis)
            .attr("transform", `translate(0, ${this.height})`);

        xLayer
            .selectAll(".tick line")
            .attr("class", "x-level")
            .attr("y1", 0)
            .attr("y2", -this.height);

        const yLayer = this.d3El
            .append("g")
            .attr("class", "axis y-axis")
            .call(yAxis);

        yLayer
            .selectAll(".tick line")
            .attr("class", "y-level")
            .attr("x1", 0)
            .attr("x2", this.width);

        yLayer.select(".tick line").remove();
        xLayer.select(".tick line").remove();
    }

    protected initGradient(colorCode: string): string {
        const id = `gradient-${colorCode}`;
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
            .style("stop-color", "#" + colorCode) //end in red
            .style("stop-opacity", 0);

        lg.append("stop")
            .attr("offset", "100%")
            .style("stop-color", "#" + colorCode) //start in blue
            .style("stop-opacity", 1);
        return id;
    }

    private drawAxesLabels() {
        const labelsGroup = this.d3El
            .append("g")
            .attr("class", "axis-labels")
            .attr("transform", "translate(0, 0)"); // Adjust the translation based on your chart's margins
        labelsGroup
            .append("text")
            .attr("class", "x-axis-label")
            .attr("x", this.width / 2) // Adjust the x position based on your chart's width
            .attr("y", this.height + MARGINS.bottom - 10) // Adjust the y position based on your chart's height and margin
            .attr("text-anchor", "middle") // Set the text-anchor to align the label in the center
            .attr("fill", "currentColor")
            .text(this.labels.x);

        labelsGroup
            .append("text")
            .attr("class", "y-axis-label")
            .attr("y", -MARGINS.left + 10) // Adjust the x position based on your chart's height
            .attr("x", -this.height / 2) // Adjust the y position based on your chart's margin
            .attr("text-anchor", "middle") // Set the text-anchor to align the label in the middle
            .attr("transform", "rotate(-90)") // Rotate the label vertically
            .attr("fill", "currentColor")
            .text(this.labels.y);
    }

    public handleMouseOver(element: any, d: any) {
        // Show a tooltip or update a div element with the data
        // For example, you can add a tooltip with the year and value
        d3.select(element).attr("r", 3); // Increase the size of the data point

        const label = `X: ${d.x.toFixed(2)}, Value: ${d.y.toFixed(2)}`;
        const labelGroup = this.d3El
            .append("g")
            .attr("class", "data-label-group");
        const hText = 20;
        const wText = 5 * (label.length + 2);

        let xPos = this.xScale(d.x) + 5;
        let yPos = this.yScale(d.y);

        if (xPos + wText > this.width) {
            xPos = xPos - wText - 10;
        }
        if (yPos - hText - 23 < 0) {
            yPos += hText;
        }

        // Append a rect for the background
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
        // Hide the tooltip or remove the div element
        d3.select(element).attr("r", 2.5); // Reset the size of the data point

        this.d3El.selectAll(".data-label-group").remove();
    }

    public drawLevels() {
        const xDividerLevels = [2, 4, 6]; // Example values for x-axis divider levels
        const yDividerLevels = [20, 40, 60]; // Example values for y-axis divider levels

        this.d3El
            .selectAll(".x-divider-line")
            .data(xDividerLevels)
            .enter()
            .append("line")
            .attr("class", "divider-line x-divider-line")
            .attr("x1", (d) => this.xScale(d))
            .attr("y1", 0)
            .attr("x2", (d) => this.xScale(d))
            .attr("y2", this.height);

        this.d3El
            .selectAll(".y-divider-line")
            .data(yDividerLevels)
            .enter()
            .append("line")
            .attr("class", "divider-line y-divider-line")
            .attr("x1", 0)
            .attr("y1", (d) => this.yScale(d))
            .attr("x2", this.width)
            .attr("y2", (d) => this.yScale(d));
    }
}

export const initLineChart = (svg: Element): LineChart => {
    return new LineChart(svg);
};
