function ScatterPlot(controller, container, x_name, y_name, r_name){
    this.controller = controller;
    this.container = container;

    this.svg = null;
    this.margin = { top: 20, right: 30, bottom: 40, left: 40 };
    this.height = 0;
    this.width = 0;

    this.tooltip = null;

    this.axis = {};
    this.x_name = x_name;
    this.y_name = y_name;
    this.radius_name = r_name;
    this.mode = "log";
    this.axis.x = null;
    this.axis.y = null;
    this.axis.r = null;

    this.data = [];
    this.level = 'community_areas';
}

ScatterPlot.prototype = {
    constructor: ScatterPlot,

    loadData: function(data){
        // Receives the same data object as the map
        this.data = [];
        for (let i = 0; i < data.length; i++){
            let elem = {};
            elem.TOTAL_KWH = data[i].properties.TOTAL_KWH;
            if (elem.TOTAL_KWH > 0)
                elem.LOG_TOTAL_KWH = Math.log(elem.TOTAL_KWH);
            else elem.LOG_TOTAL_KWH = 0;

            elem.TOTAL_THERMS = data[i].properties.TOTAL_THERMS;
            if (elem.TOTAL_THERMS > 0)
                elem.LOG_TOTAL_THERMS = Math.log(elem.TOTAL_THERMS);
            else elem.LOG_TOTAL_THERMS = 0;

            elem.KWH_TOTAL_SQFT = data[i].properties.KWH_TOTAL_SQFT;
            if (elem.KWH_TOTAL_SQFT > 0)
                elem.LOG_KWH_TOTAL_SQFT = Math.log(elem.KWH_TOTAL_SQFT);
            else elem.LOG_KWH_TOTAL_SQFT = 0;

            elem.THERMS_TOTAL_SQFT = data[i].properties.THERMS_TOTAL_SQFT;
            if (elem.THERMS_TOTAL_SQFT > 0)
                elem.LOG_THERMS_TOTAL_SQFT = Math.log(elem.THERMS_TOTAL_SQFT);
            else elem.LOG_THERMS_TOTAL_SQFT = 0;

            elem.name = data[i].properties.community;
            elem.population = data[i].properties.POPULATION;
            elem.total_units = data[i].properties.TOTAL_UNITS;
            elem.occupied_units = data[i].properties.OCCUPIED_UNITS;
            elem.percentage_occupied_units = (data[i].properties.OCCUPIED_UNITS / data[i].properties.TOTAL_UNITS) * 100;
            elem.occupied_housing_units = data[i].properties.OCCUPIED_HOUSING_UNITS;
            elem.renter_occupied_housing_units = data[i].properties.RENTER_OCCUPIED_HOUSING_UNITS;

            this.data.push(elem);
        }
    },

    createTooltip: function(){
        this.tooltip = d3.select(this.container).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    },

    changeXAxis: function(new_axis_name){
        this.changeAxis(null, new_axis_name, null, null);
    },

    changeYAxis: function(new_axis_name){
        this.changeAxis(null, null, new_axis_name, null);
    },    

    changeProperty: function(property) {
        this.changeAxis(null, null, null, property);
    },

    changeScale: function(scale) {
        this.changeAxis(scale, null, null, null);
    },

    changeAxis: function(mode, x_name, y_name, r_name){
        let self = this;

        if (mode != null) self.mode = mode;
        if (x_name != null) self.x_name = x_name;
        if (y_name != null) self.y_name = y_name;
        if (r_name != null) self.radius_name = r_name;

        if (self.mode == "log"){
            self.axis.x.domain(d3.extent(self.data, function(d) { return d["LOG_" + self.x_name]; })).nice();
            self.axis.y.domain(d3.extent(self.data, function(d) { return d["LOG_" + self.y_name]; })).nice();
        } else {
            self.axis.x.domain(d3.extent(self.data, function(d) { return d[self.x_name]; })).nice();
            self.axis.y.domain(d3.extent(self.data, function(d) { return d[self.y_name]; })).nice();
        }

        self.svg.selectAll(".dot")
            .data(self.data)
            .transition()
            .duration(1000)
            .delay(function(d, i) {
                return i / self.data.length * 500;
            }).attr("cx", function(d) {
                if (self.mode == "log")
                    return self.axis.x(d["LOG_" + self.x_name]);
                else return self.axis.x(d[self.x_name]);
            }).attr("cy", function(d) {
                if (self.mode == "log")
                    return self.axis.y(d["LOG_" + self.y_name]);
                else return self.axis.y(d[self.y_name]);
            }).attr("r", function(d)  { 
                return self.axis.r(d[self.radius_name]); });

        self.svg.select(".x.axis")
            .transition()
            .duration(1000)
            .call(d3.axisBottom(self.axis.x).tickFormat(d3.format(".2s")));

        self.svg.select(".y.axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(self.axis.y).tickFormat(d3.format(".2s")));

        d3.select(".scatter-x-text").remove();
        self.svg
            .append("text")
                .attr("transform", "translate(0," + self.height + ")")
                .attr("class", "label path-scatter scatter-x-text")
                .attr("x", self.width)
                .attr("y", -6)
                .style("text-anchor", "end")
                .style("color", "black")
                .style("font", "10px sans-serif")
                .text(self.x_name);

        d3.select(".scatter-y-text").remove();
        self.svg
            .append("text")
                .attr("class", "label path-scatter scatter-y-text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .style("color", "black")
                .style("font", "10px sans-serif")
                .text(self.y_name);
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

        self.axis.x.domain(d3.extent(self.data, function(d) { return d["LOG_" + self.x_name]; })).nice();
        self.axis.y.domain(d3.extent(self.data, function(d) { return d["LOG_" + self.y_name]; })).nice();
        self.axis.r.domain(d3.extent(self.data, function(d) { return d[self.radius_name]; })).nice();

        self.svg.append("g")
            .attr("class", "x axis path-scatter")
            .attr("transform", "translate(0," + self.height + ")")
            .call(xAxis.tickFormat(d3.format(".2s")));

        self.svg
            .append("text")
                .attr("transform", "translate(0," + self.height + ")")
                .attr("class", "label path-scatter scatter-x-text")
                .attr("x", self.width)
                .attr("y", -6)
                .style("text-anchor", "end")
                .style("color", "black")
                .style("font", "10px sans-serif")
                .text(self.x_name);

        self.svg.append("g")
            .attr("class", "y axis path-scatter")
            .call(yAxis.tickFormat(d3.format(".2s")));

        self.svg
            .append("text")
                .attr("class", "label path-scatter scatter-y-text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .style("color", "black")
                .style("font", "10px sans-serif")
                .text(self.y_name);

        self.svg.selectAll(".dot")
            .data(self.data)
            .enter().append("circle")
            .attr("class", function(d) {
                return "dot " + d.name.replace(/\s+/g, "");
            })
            .attr("r", function(d)  { 
                return self.axis.r(d[self.radius_name]); })
            .attr("cx", function(d) { return self.axis.x(d["LOG_" + self.x_name]); })
            .attr("cy", function(d) { return self.axis.y(d["LOG_" + self.y_name]); })
            .on("mouseover", function(d){
                d3.select(this).classed("dot_selected", true);

                var div = d3.select(".tooltip").style("opacity", .9);
                div.html("<b>" + d.name + "</b>")
                   .style("left", (d3.select(this).attr("cx")) - 5  + "px")
                   .style("top", (d3.event.pageY - 50) + "px");
            })
            .on("mouseout", function(d){
                d3.select(this).classed("dot_selected", false);
                d3.select(".tooltip").style("opacity", 0);
            })
            .on("click", function(d){
                var path = $(".p" + d.name.replace(/\s+/g, ""));
                self.controller.clickScatterPlotCircle(path, d.name);
            });
    },

    getImplName: function(friendly_name) {
        if (friendly_name == "total KWH") return "TOTAL_KWH";
        if (friendly_name == "total Therms") return "TOTAL_THERMS";
        if (friendly_name == "KWH SQFT") return "KWH_TOTAL_SQFT";
        if (friendly_name == "Thm SQFT") return "THERMS_TOTAL_SQFT";
        if (friendly_name == "Ranking Electricity") return "RANK_ELECTRICITY";
        if (friendly_name == "Ranking Gas") return "RANK_GAS";
        if (friendly_name == "population") return "population";
        if (friendly_name == "total units") return "total_units";
        if (friendly_name == "occupied units") return "occupied_units";
        if (friendly_name == "percentage occupied units") return "percentage_occupied_units";
        if (friendly_name == "occupied housing units") return "occupied_housing_units";
        if (friendly_name == "renter occupied housing units") return "renter_occupied_housing_units";
        return "";
    }

}