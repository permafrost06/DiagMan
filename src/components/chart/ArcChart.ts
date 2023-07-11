import * as d3 from "d3";

interface Legend {
    label: string;
    color: string;
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
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
};

export class ArcChart {
    protected svg: Element;
    protected d3El: d3.Selection<Element, unknown, null, undefined>;
    protected height: number;
    protected width: number;
    protected thickness: number = 10;
    protected legends: string[] = [];

    constructor(svg: Element) {
        this.svg = svg;
        this.d3El = d3.select(svg);
        (this.height = 0), (this.width = 0);
    }

    public resize(newHeight: number, newWidth: number): ArcChart {
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

    public draw(data: number[]) {
        this.svg.innerHTML = "";
        const size = Math.min(this.width, this.height);
        let sum = 0;
        const endAngles: number[] = data
            .map((num) => {
                sum += num;
                return -Math.PI / 2 + (Math.PI * sum) / 100;
            })
            .reverse();

        //@ts-ignore
        const arcGen = d3
            .arc()
            .innerRadius(Math.max(size - this.thickness, 10))
            .outerRadius(size)
            .startAngle(-Math.PI / 2)
            .endAngle((d) => d);

        const group = this.d3El
            .append("g")
            .attr("transform", `translate(${this.width / 2}, ${this.height})`);
        group
            .selectAll("path")
            .data(endAngles)
            .enter()
            .append("path")
            //@ts-ignore
            .attr("d", arcGen)
            .attr("fill", (d, i) => "#" + COLORS[i]);

        this.drawLegends();
    }

    public setLegends(legends: string[]): ArcChart {
        this.legends = legends;
        return this;
    }

    public setThickness(thickness: number): ArcChart {
        this.thickness = thickness;
        return this;
    }

    public drawLegends(): ArcChart {
        const legendData: Legend[] = [];

        const max = Math.min(this.legends.length, COLORS.length);

        if (max === 0) {
            return this;
        }

        for (let i = 0; i < max; i++) {
            legendData.push({
                label: this.legends[i],
                color: COLORS[max - i - 1],
            });
        }

        // Create the legend group element
        const legend = this.d3El
            .append("g")
            .attr("class", "legend")
            .attr(
                "transform",
                `translate(${this.width / 2 - 50}, ${this.height - 100})`
            );

        // Append rectangles and text to represent each item in the legend
        const legendItems = legend
            .selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", function (d, i) {
                return "translate(0," + i * 15 + ")";
            });

        legendItems
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", function (d) {
                return "#" + d.color;
            });

        legendItems
            .append("text")
            .attr("x", 15)
            .attr("y", 5)
            .attr("dy", "0.35em")
            .text(function (d) {
                return d.label;
            });

        return this;
    }
}

export const initArcChart = (svg: Element): ArcChart => {
    return new ArcChart(svg);
};
