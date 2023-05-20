import * as d3 from "d3";

export interface ArcChart {
    resize: (newHeight: number, newWidth: number) => void;
    draw: (data: number[]) => void;
    setThickness: (thinkness: number) => void;
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

export const initArcChart = (svg: Element): ArcChart => {
    const d3El: d3.Selection<Element, unknown, null, undefined> =
        d3.select(svg);
    let height = 0,
        width = 0,
        thickness = 100;

    let arcGen: any;

    const setThickness = (newthickness: number) => {
        thickness = newthickness;
    };

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

    const draw = (data: number[]) => {
        svg.innerHTML = "";
        const size = Math.min(width, height);
        let sum = 0;
        const endAngles: number[] = data
            .map((num) => {
                sum += num;
                return -Math.PI / 2 + (Math.PI * sum) / 100;
            })
            .reverse();

        //@ts-ignore
        arcGen = d3
            .arc()
            .innerRadius(Math.max(size - thickness, 10))
            .outerRadius(size)
            .startAngle(-Math.PI / 2)
            .endAngle((d) => d);

        const group = d3El
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height})`);
        group
            .selectAll("path")
            .data(endAngles)
            .enter()
            .append("path")
            .attr("d", arcGen)
            .attr("fill", (d, i) => "#" + COLORS[i]);
    };

    return {
        draw,
        resize,
        setThickness,
    };
};
