import * as d3 from "d3";

export interface DataPoint {
    x: number;
    y: number;
}

export interface LineChart {
    resize: (newHeight: number, newWidth: number) => void;
    draw: (dataGroups: DataPoint[][]) => void;
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
    bottom: 20,
    left: 30,
};

export const initLineChart = (svg: Element): LineChart => {
    const d3El = d3.select(svg);
    let height = 0,
        width = 0;

    let xScale: any, yScale: any;

    const resize = (newHeight: number, newWidth: number) => {
        height = newHeight - MARGINS.top - MARGINS.bottom;
        width = newWidth - MARGINS.left - MARGINS.right;
        d3El.attr("height", height)
            .attr("width", width)
            .style(
                "margin",
                `${MARGINS.top}px ${MARGINS.right}px ${MARGINS.bottom}px ${MARGINS.left}px`
            );
    };

    const draw = (dataGroups: DataPoint[][]) => {
        let maxYVal = 0;
        let maxXVal = 0;
        svg.innerHTML = "";

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

        xScale = d3.scaleLinear().domain([0, maxXVal]).range([0, width]);
        yScale = d3.scaleLinear().domain([0, maxYVal]).range([height, 0]);
        const line = d3
            .line()
            .x((d: any) => xScale(d.x))
            .y((d: any) => yScale(d.y))
            .curve(d3.curveLinear);

        const xAxis = d3
            .axisBottom(xScale)
            .ticks(10)
            .tickFormat((i: any) => i + 1);

        const yAxis = d3.axisLeft(yScale).ticks(5);

        d3El.append("g")
            .call(xAxis)
            .attr("transform", `translate(0, ${height})`);
        d3El.append("g").call(yAxis);

        const lineLayer = d3El.append("g");
        const pointsLayer = d3El.append("g");

        dataGroups.forEach((data, i) => {
            const grad = initGradient(COLORS[i]);
            lineLayer
                .selectAll(".line")
                .data([data])
                .join("path")
                .attr("d", (d: any) => line(d))
                .attr("fill", `url(#${grad})`)
                .attr("stroke", "black");

            pointsLayer
                .append("g")
                .selectAll(".data-point")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "data-point")
                .attr("cx", (d: any) => xScale(d.x))
                .attr("cy", (d: any) => yScale(d.y))
                .attr("r", 4)
                .style("cursor", "pointer")
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut);
        });
    };

    function initGradient(colorCode: string): string {
        const id = `gradient-${colorCode}`;
        const lg = d3El
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

    function handleMouseOver(_evt: MouseEvent, d: any) {
        // Show a tooltip or update a div element with the data
        // For example, you can add a tooltip with the year and value
        //@ts-ignore
        d3.select(this).attr("r", 6); // Increase the size of the data point

        const label = `X: ${d.x.toFixed(2)}, Value: ${d.y.toFixed(2)}`;
        const labelGroup = d3El.append("g").attr("class", "data-label-group");
        const hText = 20;
        const wText = 5 * (label.length + 2);

        let xPos = xScale(d.x);
        let yPos = yScale(d.y);

        if (xPos + wText > width) {
            xPos = xPos - wText;
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
            .style("fill", "#f2f2f2")
            .style("opacity", 0.9)
            .style("filter", "drop-shadow(0 0 5px rgba(0, 0, 0, 0.2))")
            .attr("rx", 5) // Set the border radius
            .attr("ry", 5);

        labelGroup
            .append("text")
            .attr("class", "data-label")
            .attr("x", xPos + 10)
            .attr("y", yPos - 10)
            .text(label)
            .style("font-size", "10px")
            .style("background-color", "#f2f2f2") // Set the background color
            .style("padding", "5px") // Set the padding
            .style("border-radius", "5px") // Set the border radius
            .style("box-shadow", "0 0 5px rgba(0, 0, 0, 0.2)");
    }

    // Function to handle mouseout event
    function handleMouseOut() {
        // Hide the tooltip or remove the div element
        //@ts-ignore
        d3.select(this).attr("r", 4); // Reset the size of the data point

        d3El.selectAll(".data-label-group").remove();
    }

    return {
        draw,
        resize,
    };
};
