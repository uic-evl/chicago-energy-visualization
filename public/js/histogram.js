function Histogram(container, controller, data, title, community) {

	this.container = "#" + container;
	this.controller = controller;
	this.data = data;

	this.svg = null;
    this.margin = { top: 10, right: 30, bottom: 30, left: 20 };
    this.height = 0;
    this.width = 0;

    this.x = null;
    this.y = null;
    this.bins = null;

    this.title = title;
    this.tooltip = null;
    this.community = community;

}

Histogram.prototype = {
	constructor: Histogram,

	init: function() {
		let self = this;
		let formatCount = d3.format(",.0f");

		self.width = $(self.container).parent().width() - self.margin.left - self.margin.right;
        self.height = $(self.container).parent().height() - self.margin.top - self.margin.bottom;

        self.svg = d3.select(self.container).append("svg")
            .attr("width", self.width + self.margin.left + self.margin.right)
            .attr("height", self.height + self.margin.top + self.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

        let max = d3.max(self.data, d => d);
        self.x = d3.scaleLinear()
        	.range([0, self.width])
        	.domain([0, max]);
        
        self.bins = d3.histogram()
        				.domain(self.x.domain())
        				.thresholds(self.x.ticks(20))
        				(self.data);

        self.y = d3.scaleLinear()
        			.domain([0, d3.max(self.bins, function(d) { return d.length; })])
					.range([self.height, 0]);

        let bar = self.svg.selectAll(".bar")
        			.data(self.bins)
        			.enter().append("g")
        				.attr("class", "bar")
        				.attr("transform", function(d) {
        					return "translate(" + self.x(d.x0) + "," + self.y(d.length) + ")";
        				});

        bar.append("rect")
		    .attr("x", 1)
		    .attr("width", self.x(self.bins[0].x1) - self.x(self.bins[0].x0) - 1)
		    .attr("height", function(d) { return self.height - self.y(d.length) });

		/*
		bar.append("text")
		    .attr("dy", ".75em")
		    .attr("y", 6)
		    .attr("x", (self.x(self.bins[0].x1) - self.x(self.bins[0].x0)) / 2)
		    .attr("text-anchor", "middle")
		    .text(function(d) { return formatCount(d.length); });*/

		self.svg.append("g")
		    .attr("class", "axis axis--x")
		    .attr("transform", "translate(0," + (self.height) + ")")
		    .call(d3.axisBottom(self.x)
		    		.ticks(5)
		    		.tickValues([0, max])
		    		.tickFormat(d3.formatPrefix(".1", 1e6)));

		self.svg.append("text")
            .attr("class", "histogram-title")
			.attr("transform", "translate(" + self.width/2 + " ," + (self.height + 15)  + ")")
            .text(self.title);

        this.tooltip = d3.select(this.container).append("div")
            .attr("class", "tooltip-histogram")
            .style("opacity", 0);

	},

	updateLine: function(value) {
		let self = this;
		let data = [value];

		self.svg.selectAll(".consumption-line").remove();
		let line = self.svg.selectAll(".consumption-line")
					.data(data)
					.enter().append("g")
						.attr("class", "consumption-line");
		line.append("line")
			.style("stroke", "red")
			.attr("x1", self.x(value))
			.attr("y1", self.height)
			.attr("x2", self.x(value))
			.attr("y2", 0);

		self.svg.selectAll(".histogram-community-label").remove();
		self.svg.append("text")
			.text(self.community)
			.attr("class", "histogram-community-label")
			.attr("transform", "translate(" + self.x(value) + ", " + self.margin.top + ")")
			.attr("text-anchor", function() {
				if (self.x(value) > 3*self.width/4)
					return "end";
				else return "start";
			});
	}
}