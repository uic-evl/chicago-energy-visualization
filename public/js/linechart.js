function LineChart(container, energy, data){
    this.chart = {};

    this.margin = { top: 20, right: 30, bottom: 40, left: 40 };
    this.height = 0;
    this.width = 0;
    this.container = container;

    this.energy = energy;
    this.svg = null;

    this.data = [];
    this.min = Math.min(...data);
    this.max = Math.max(...data);

    let elem = { values: [] };
    for (let i = 0; i < 12; i++)
        elem.values.push({
            'date': new Date(2010, i, 1),
            'consumption': data[i]
        });
    this.data.push(elem);

    this.showXticks = true;
    this.showYticks = true;
    this.num_x_ticks = 6;
    this.num_y_ticks = 3;
    this.color = "red";
}

LineChart.prototype = {
    constructor: LineChart,

    init: function(){
        let self = this,
            timeParser = d3.timeParse("%Y%m%d"),
            formatter = d3.format(".2s");

        d3.select("#" + self.container).select("svg").remove();

        self.svg = d3.select("#" + self.container).append("svg");
        self.width = $("#" + self.container).parent().width() - self.margin.left - self.margin.right;
        self.height = $("#" + self.container).parent().height() - self.margin.top - self.margin.bottom;
        self.svg.attr("width", self.width + self.margin.left + self.margin.right)
                .attr("height", self.height + self.margin.top + self.margin.bottom)
        
        let g = self.svg.append("g")
                .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

        let x = d3.scaleTime().range([0, self.width]),
            y = d3.scaleLinear().range([self.height, 0]);

        x.domain([new Date(2010, 0, 1), new Date(2010, 11, 1)]);
        y.domain([self.min, self.max]);

        let line = d3.line()
            .curve(d3.curveBasis)
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.consumption); });

        // append ticks on the X axis
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + self.height + ")")
            .call(d3.axisBottom(x)
                .ticks(self.num_x_ticks)
                .tickFormat(d3.timeFormat("%b")))
            .selectAll("text")
                .attr("text-anchor", "end");

        let yTicks = g.append("g")
                        .attr("class", "axis axis--y")
                        .call(d3.axisLeft(y)
                            .ticks(self.num_y_ticks)
                            .tickFormat(d3.format(".2s")));

        let zone = g.selectAll(".line_zone")
            .data(self.data)
            .enter().append("g")
            .attr("class", "line_zone");

        zone.append("path")
            .attr("class", "line path-linechart")
            .attr("d", function(d) { 
                return line(d.values); })
            .style("stroke", self.color);
    }
}