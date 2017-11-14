function ScatterPlot(controller, container){
    this.controller = controller;
    this.container = container;

    this.svg = null;
    this.margin = { top: 20, right: 30, bottom: 40, left: 40 };
    this.height = 0;
    this.width = 0;

    this.tooltip = null;

    this.axis = {};
    this.axis.x = null;
    this.axis.y = null;
    this.axis.r = null;

    this.data = [];
    this.level = 'community_areas';
}

/*
    elem = {
        TOTAL_KWH
        TOTAL_THERMS
        name
    }
*/

ScatterPlot.prototype = {
    constructor: ScatterPlot,

    loadData: function(data){
        // Receives the same data object as the map
        this.data = [];
        for (let i = 0; i < data.length; i++){
            let elem = {};
            elem.TOTAL_KWH = data[i].properties.consumption.TOTAL_KWH;
            if (elem.TOTAL_KWH > 0)
                elem.TOTAL_LOG_KWH = Math.log(elem.TOTAL_KWH);
            else elem.TOTAL_LOG_KWH = 0;

            elem.TOTAL_THERMS = communities[i].properties.consumption.gas.total_cons;
            if (elem.TOTAL_THERMS > 0)
                elem.TOTAL_LOG_THERMS = Math.log(elem.TOTAL_THERMS);
            else elem.TOTAL_LOG_THERMS = 0;

            elem.name = communities[i].properties.community;
            elem.population = 5;//communities[i].properties.population;
            this.data.push(elem);
        }
    },

    createTooltip: function(){
        this.tooltip = d3.select(this.container).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    },

    changeScale: function(mode){
        let mode = mode,
            self = this;

        if (mode == "log"){
            self.axis.x.domain(d3.extent(self.data, function(d) { return d.TOTAL_LOG_KWH; })).nice();
            self.axis.y.domain(d3.extent(self.data, function(d) { return d.TOTAL_LOG_THERMS; })).nice();
        } else {
            self.axis.x.domain(d3.extent(self.data, function(d) { return d.TOTAL_KWH; })).nice();
            self.axis.y.domain(d3.extent(self.data, function(d) { return d.TOTAL_THERMS; })).nice();
        }

        self.svg.selectAll(".dot")
            .data(self.data)
            .transition()
            .duration(1000)
            .delay(function(d, i) {
                return i / self.data.length * 500;
            }).attr("cx", function(d) {
                if (mode == "log")
                    return self.axis.x(d.TOTAL_LOG_KWH);
                else return self.axis.x(d.TOTAL_KWH);
            }).attr("cy", function(d) {
                if (mode == "log")
                    return self.axis.y(d.TOTAL_LOG_THERMS);
                else return self.axis.y(d.TOTAL_THERMS);
            });

        self.svg.select(".x.axis")
            .transition()
            .duration(1000)
            .call(d3.axisBottom(self.axis.x).tickFormat(d3.format(".2s")));

        self.svg.select(".y.axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(self.axis.y).tickFormat(d3.format(".2s")));
    },

    init: function(data){
        var self = this;

        self.createTooltip();
        self.loadData(data);

        self.width = $(self.container).parent().width() - self.margin.left - self.margin.right;
        self.height = $(self.container).parent().height() - self.margin.top - self.margin.bottom;

        self.axis.x = d3.scaleLinear().range([0, self.width]);
        self.axis.y = d3.scaleLinear().range([self.height, 0]);
        self.axis.r = d3.scaleLinear().range([3, 20]);

        var xAxis = d3.axisBottom(self.axis.x);
        var yAxis = d3.axisLeft(self.axis.y);

        self.svg = d3.select(self.container).append("svg")
            .attr("width", self.width + self.margin.left + self.margin.right)
            .attr("height", self.height + self.margin.top + self.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

        self.axis.x.domain(d3.extent(self.data, function(d) { return d.TOTAL_LOG_KWH; })).nice();
        self.axis.y.domain(d3.extent(self.data, function(d) { return d.TOTAL_LOG_THERMS; })).nice();
        self.axis.r.domain(d3.extent(self.data, function(d) { return d.population; })).nice();

        self.svg.append("g")
            .attr("class", "x axis path-scatter")
            .attr("transform", "translate(0," + self.height + ")")
            .call(xAxis.tickFormat(d3.format(".2s")));

        self.svg
            .append("text")
                .attr("transform", "translate(0," + self.height + ")")
                .attr("class", "label path-scatter")
                .attr("x", self.width)
                .attr("y", -6)
                .style("text-anchor", "end")
                .style("color", "black")
                .style("font", "10px sans-serif")
                .text("Electricity");

        self.svg.append("g")
            .attr("class", "y axis path-scatter")
            .call(yAxis.tickFormat(d3.format(".2s")));

        self.svg
            .append("text")
                .attr("class", "label path-scatter")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .style("color", "black")
                .style("font", "10px sans-serif")
                .text("Gas")

        self.svg.selectAll(".dot")
            .data(self.data)
            .enter().append("circle")
            .attr("class", function(d) {
                return "dot " + d.name.replace(/\s+/g, "");
            })
            .attr("r", function(d)  { return self.axis.r(d.population); })
            .attr("cx", function(d) { return self.axis.x(d.TOTAL_KWH); })
            .attr("cy", function(d) { return self.axis.y(d.TOTAL_LOG_THERMSO); })
            .on("mouseover", function(d){
               var div = d3.select(".tooltip").style("opacity", .9);
               div.html("<b>" + d.name + "</b>")
                   .style("left", (d3.select(this).attr("cx")) - 30  + "px")
                   .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d){
                d3.select(".tooltip").style("opacity", 0);
            })
            .on("click", function(d){
                var path = $(".p" + d.name.replace(/\s+/g, ""));
                self.controller.clickScatterPlotCircle(path, d.name);
            });
    }
}