import * as d3 from "d3";

export interface TransferChartData {
    total: number;
    packets: number[];
}

export class TransferChart {
    protected svg: Element;
    protected d3El: d3.Selection<Element, unknown, null, undefined>;
    protected height: number;
    protected width: number;

    protected xScale: any;
    protected yScale: any;

    constructor(svg: Element) {
        this.svg = svg;
        this.d3El = d3.select(svg);
        (this.height = 0), (this.width = 0);
    }

    public resize(newHeight: number, newWidth: number): TransferChart {
        this.height = newHeight;
        this.width = newWidth;
        this.d3El.attr("height", this.height).attr("width", this.width);
        return this;
    }

    public draw(data: TransferChartData) {
        this.svg.innerHTML = "";

        let maxYval = 0;
        let totalSent = 0;
        const lineData: { x: number; y: number }[] = [{ x: 0, y: 0 }];
        data.packets.forEach((v) => {
            maxYval = Math.max(maxYval, v);
            totalSent += v;
            lineData.push({
                x: totalSent,
                y: v,
            });
        });

        if (data.total < totalSent) {
            data.total = totalSent;
        }
        lineData.push({
            x: totalSent,
            y: 0,
        });

        this.xScale = d3
            .scaleLinear()
            .domain([0, data.total])
            .range([0, this.width]);
        this.yScale = d3
            .scaleLinear()
            .domain([0, maxYval * 1.5])
            .range([this.height, 0]);

        this.drawAxes(this.height, this.width);
        const line = d3
            .line()
            .x((d: any) => this.xScale(d.x))
            .y((d: any) => this.yScale(d.y))
            .curve(d3.curveCardinal);

        this.d3El
            .append("g")
            .attr("class", "data-layer")
            .selectAll(".line")
            .data([lineData])
            .join("path")
            .attr("d", (d: any) => line(d))
            .attr("fill", "#0000ff");
    }

    protected drawAxes(remHeight: number, remWidth: number) {
        const tLayer = this.d3El.append("g").attr("class", "tiles");
        for (let i = 0; i < 11; i++) {
            const xPos = remWidth * (i / 10);
            tLayer
                .append("line")
                .attr("x1", xPos)
                .attr("x2", xPos)
                .attr("y1", remHeight)
                .attr("y2", 0)
                .attr("stroke", "#e7e7e7");
        }
        for (let i = 0; i < 6; i++) {
            const yPos = remHeight * (i / 6);
            tLayer
                .append("line")
                .attr("y1", yPos)
                .attr("y2", yPos)
                .attr("x1", remWidth)
                .attr("x2", 0)
                .attr("stroke", "#e7e7e7");
        }
    }
}

export const initTransferChart = (svg: Element): TransferChart => {
    return new TransferChart(svg);
};
