import * as d3 from "d3";

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

    protected legendColors: string[] = [];
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
    }

    public setThickness(thickness: number): ArcChart {
        this.thickness = thickness;
        return this;
    }
}

export const initArcChart = (svg: Element): ArcChart => {
    return new ArcChart(svg);
};
