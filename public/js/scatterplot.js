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
    this.level = 'COMMUNITY_AREAS';
}

ScatterPlot.prototype = {
    constructor: ScatterPlot,

    loadData: function(data){
        // Receives the same data object as the map
        this.data = [];
        for (let i = 0; i < data.length; i++){

            let elem = {};
            elem.geoid10 = data[i].properties.geoid10;
            if (data[i].properties.TOTAL_KWH){
                elem.TOTAL_KWH = data[i].properties.TOTAL_KWH;
                if (elem.TOTAL_KWH > 0)
                    elem.LOG_TOTAL_KWH = Math.log(elem.TOTAL_KWH);
                else elem.LOG_TOTAL_KWH = 0;
            } else {
                elem.TOTAL_KWH = 0;
                elem.LOG_TOTAL_KWH = 0;
            }

            if (data[i].properties.TOTAL_THERMS){
                elem.TOTAL_THERMS = data[i].properties.TOTAL_THERMS;
                if (elem.TOTAL_THERMS > 0)
                    elem.LOG_TOTAL_THERMS = Math.log(elem.TOTAL_THERMS);
                else elem.LOG_TOTAL_THERMS = 0;
            } else {
                elem.TOTAL_THERMS = 0;
                elem.LOG_TOTAL_THERMS = 0;
            }

            if (data[i].properties.KWH_TOTAL_SQFT){
                elem.KWH_TOTAL_SQFT = data[i].properties.KWH_TOTAL_SQFT;
                if (elem.KWH_TOTAL_SQFT > 0)
                    elem.LOG_KWH_TOTAL_SQFT = Math.log(elem.KWH_TOTAL_SQFT);
                else elem.LOG_KWH_TOTAL_SQFT = 0;
            } else {
                elem.KWH_TOTAL_SQFT = 0;
                elem.LOG_KWH_TOTAL_SQFT = 0;
            }

            if (data[i].properties.THERMS_TOTAL_SQFT){
                elem.THERMS_TOTAL_SQFT = data[i].properties.THERMS_TOTAL_SQFT;
                if (elem.THERMS_TOTAL_SQFT > 0)
                    elem.LOG_THERMS_TOTAL_SQFT = Math.log(elem.THERMS_TOTAL_SQFT);
                else elem.LOG_THERMS_TOTAL_SQFT = 0;
            } else {
                elem.THERMS_TOTAL_SQFT = 0;
                elem.LOG_THERMS_TOTAL_SQFT = 0;
            }

            if (data[i].properties.community)
                elem.name = data[i].properties.community;
            else 
                elem.name = data[i].properties.name10;

            elem.population = data[i].properties.POPULATION;
            if (elem.population == 0 || elem.population == undefined){ 
                elem.population = 1;
                elem.LOG_population = 0;
            } else {
                elem.LOG_population = Math.log(elem.population);
            }

            elem.total_units = data[i].properties.TOTAL_UNITS;
            if (elem.total_units == 0 || elem.total_units == undefined) elem.total_units = 1;

            elem.occupied_units = data[i].properties.OCCUPIED_UNITS;
            if (elem.occupied_units == 0 || elem.occupied_units == undefined) elem.occupied_units = 1;

            elem.percentage_occupied_units = (data[i].properties.OCCUPIED_UNITS / data[i].properties.TOTAL_UNITS) * 100;
            if (elem.percentage_occupied_units == 0 || elem.percentage_occupied_units == undefined) elem.percentage_occupied_units = 1;

            elem.occupied_housing_units = data[i].properties.OCCUPIED_HOUSING_UNITS;
            if (elem.occupied_housing_units == 0 || elem.occupied_housing_units == undefined) elem.occupied_housing_units = 1;

            elem.renter_occupied_housing_units = data[i].properties.RENTER_OCCUPIED_HOUSING_UNITS;
            if (elem.renter_occupied_housing_units == 0 || elem.renter_occupied_housing_units == undefined) elem.renter_occupied_housing_units = 1;

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

        if (self.mode == "log"){
            self.svg.select(".x.axis")
                .transition()
                .duration(1000)
                .call(d3.axisBottom(self.axis.x));

            self.svg.select(".y.axis")
                .transition()
                .duration(1000)
                .call(d3.axisLeft(self.axis.y));
        } else {
            self.svg.select(".x.axis")
                .transition()
                .duration(1000)
                .call(d3.axisBottom(self.axis.x).tickFormat(d3.format(".2s")));

            self.svg.select(".y.axis")
                .transition()
                .duration(1000)
                .call(d3.axisLeft(self.axis.y).tickFormat(d3.format(".2s")));            
        }

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
        self.axis.r = d3.scaleLinear().range([5, 40]);

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

        if (self.mode == "log"){
            self.svg.append("g")
            .attr("class", "x axis path-scatter")
            .attr("transform", "translate(0," + self.height + ")")
            .call(xAxis);

            self.svg.append("g")
            .attr("class", "y axis path-scatter")
            .call(yAxis);
        } else {
            self.svg.append("g")
            .attr("class", "x axis path-scatter")
            .attr("transform", "translate(0," + self.height + ")")
            .call(xAxis.tickFormat(d3.format(".2s")));

            self.svg.append("g")
            .attr("class", "y axis path-scatter")
            .call(yAxis.tickFormat(d3.format(".2s")));
        }
        

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
                if (self.level == "COMMUNITY_AREAS")
                    return "dot " + d.name.replace(/\s+/g, "");
                else 
                    return "dot geo" + d.geoid10;
            })
            .attr("r", function(d)  { 
                return self.axis.r(d[self.radius_name]); })
            .attr("cx", function(d) { return self.axis.x(d["LOG_" + self.x_name]); })
            .attr("cy", function(d) { return self.axis.y(d["LOG_" + self.y_name]); })
            .on("mouseover", function(d){
                d3.select(this).classed("dot_hovered", true);

                var div = d3.select(".tooltip").style("opacity", .9);
                div.html("<b>" + d.name + "</b>")
                   .style("left", (d3.select(this).attr("cx")) - 5  + "px")
                   .style("top", (d3.event.pageY - 50) + "px");

                if (self.level == "COMMUNITY_AREAS")
                    self.controller.highlightMinimap(d.name);
                else
                    self.controller.highlightDetailsMap(d.geoid10);
            })
            .on("mouseout", function(d){
                d3.select(this).classed("dot_hovered", false);
                d3.select(".tooltip").style("opacity", 0);

                if (self.level == "COMMUNITY_AREAS")
                    self.controller.resetHighlightMinimap();
                else self.controller.resetHighlightDetailsMap();
            })
            .on("click", function(d){
                //var path = $(".p" + d.name.replace(/\s+/g, ""));
                d3.select(".dot_selected").classed("dot_selected", false);
                d3.select(this).classed("dot_selected", true);
                self.controller.selectScatterplotItem(d.name);
            });
    },

    getImplName: function(friendly_name) {
        if (friendly_name == "total kWh") return "TOTAL_KWH";
        if (friendly_name == "total Thm") return "TOTAL_THERMS";
        if (friendly_name == "kWh SQFT") return "KWH_TOTAL_SQFT";
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
    },

    highlightElement: function(id) {

        if (this.level == "COMMUNITY_AREAS")
            d3.select("." + id.replace(/\s+/g, "")).classed("dot_hovered", true);
        else
            d3.select(".geo" + id).classed("dot_hovered", true);

    },

    resetHighlight: function() {
        d3.selectAll(".dot_hovered").classed("dot_hovered", false);
    },

    addSelectedElementStyle: function(id, sender) {

        if (this.level == "COMMUNITY_AREAS" && sender == "COMMUNITY_AREAS"){
            d3.select(".dot_selected").classed("dot_selected", false);
            d3.select("." + id.replace(/\s+/g, "")).classed("dot_selected", true);
        } else if ((this.level == "CENSUS_BLOCKS" && sender == "CENSUS_BLOCKS") ||
                    (this.level == "CENSUS_TRACTS" && sender == "CENSUS_TRACTS")){
            d3.select(".dot_selected").classed("dot_selected", false);
            d3.select(".geo" + id).classed("dot_selected", true);
        }
    },

    update: function(data, level) {
        this.level = level;
        console.log(level);
        d3.select(this.container).select("svg").remove();
        this.init(data);
    }


}