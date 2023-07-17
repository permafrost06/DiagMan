import * as d3 from "d3";

interface Legend {
    label: string;
    color: string;
}

interface LegendProps {
    orientation: "horizontal" | "vertical";
    fontSize: number;
    gap: number;
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}

type PreparedLegend = [Legend[], number, number];

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
    top: 20,
    right: 0,
    bottom: 20,
    left: 20,
};

export class DonutChart {
    protected svg: Element;
    protected d3El: d3.Selection<Element, unknown, null, undefined>;
    protected height: number;
    protected width: number;
    protected thickness: number = 10;
    protected legends: string[] = [];

    protected legendOpts: LegendProps = {
        orientation: "vertical",
        fontSize: 15,
        gap: 30,
        margins: {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
        },
    };

    constructor(svg: Element) {
        this.svg = svg;
        this.d3El = d3.select(svg);
        (this.height = 0), (this.width = 0);
    }

    public resize(newHeight: number, newWidth: number): DonutChart {
        this.height = newHeight - MARGINS.top - MARGINS.bottom;
        this.width = newWidth - MARGINS.left - MARGINS.right;
        this.d3El.attr("height", this.height).attr("width", this.width);
        return this;
    }

    public draw(data: number[]) {
        this.svg.innerHTML = "";
        const size = Math.min(this.width / 2, this.height) / 2;

        //@ts-ignore
        const arcGen = d3
            .arc()
            .innerRadius(Math.max(size - this.thickness, 10))
            .outerRadius(size);

        const group = this.d3El
            .append("g")
            .attr(
                "transform",
                `translate(${size + MARGINS.left}, ${
                    this.height / 2 + MARGINS.top
                })`
            );
        let last = 0;
        group
            .selectAll("path")
            .data(data)
            .enter()
            .append("path")
            //@ts-ignore
            .attr("d", (percentage) => {
                const startAngle = last;
                last += (percentage * Math.PI * 2) / 100;
                //@ts-ignore
                return arcGen({
                    startAngle,
                    endAngle: last,
                });
            })
            .attr("fill", (_d, i) => COLORS[i]);

        if (last < 6.28) {
            group
                .append("path")
                .attr(
                    "d",
                    //@ts-ignore
                    arcGen({
                        startAngle: last,
                        endAngle: Math.PI * 2,
                    })
                )
                .attr("fill", "#e7e7e7");
        }

        this.drawLegends();
    }

    public setLegends(legends: string[]): DonutChart {
        this.legends = legends;
        return this;
    }

    public setThickness(thickness: number): DonutChart {
        this.thickness = thickness;
        return this;
    }

    protected prepareLegends(): PreparedLegend {
        const legendData: Legend[] = [];

        const max = Math.min(this.legends.length, COLORS.length);

        if (max === 0) {
            return [[], 0, 0];
        }

        let height = this.legendOpts.margins.top;
        let maxLineW = 0;
        const maxChars =
            (this.width / 2 -
                (this.legendOpts.margins.left + this.legendOpts.margins.right) -
                this.legendOpts.fontSize * 2) /
            this.legendOpts.fontSize;

        for (let i = 0; i < max; i++) {
            legendData.push({
                label: this.legends[i],
                color: COLORS[i],
            });
            height +=
                Math.ceil(this.legends[i].length / maxChars) +
                this.legendOpts.gap;
            maxLineW = Math.max(
                maxLineW,
                Math.min(this.legends[i].length, maxChars)
            );
        }
        return [legendData, height, maxLineW];
    }

    public drawLegends(): DonutChart {
        const [legendData, height, width] = this.prepareLegends();
        if (!legendData) {
            return this;
        }

        const halfW = this.width / 2;
        let topPos = MARGINS.top;
        if (height < this.height) {
            topPos += (this.height - height) / 2;
        }

        let leftPos = halfW;
        if (halfW > width) {
            leftPos += (halfW - width) / 2 - 50;
        }

        // Create the legend group element
        const legend = this.d3El
            .append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${leftPos}, ${topPos})`);

        // Append rectangles and text to represent each item in the legend
        const legendItems = legend
            .selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr(
                "transform",
                (_d, i) => `translate(0, ${i * this.legendOpts.gap})`
            );

        legendItems
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.legendOpts.fontSize)
            .attr("height", this.legendOpts.fontSize)
            .attr("fill", (d) => d.color);

        legendItems
            .append("text")
            .attr("x", this.legendOpts.fontSize * 1.5)
            .attr("y", 0)
            .attr("dy", this.legendOpts.fontSize * 0.88)
            .attr("fontSize", this.legendOpts.fontSize)
            .text(function (d) {
                return d.label;
            });

        return this;
    }
}

export const initDonutChart = (svg: Element): DonutChart => {
    return new DonutChart(svg);
};
