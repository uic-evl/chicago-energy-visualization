function LineChart(container, energy, data, id){
    this.chart = {};

    this.margin = { top: 20, right: 30, bottom: 30, left: 40 };
    this.height = 0;
    this.width = 0;
    this.container = container;
    this.colors = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3"];

    this.energy = energy;
    this.svg = null;

    this.data = [];
    if (data != null){
        this.min = Math.min(...data);
        this.max = Math.max(...data);
    }

    let elem = { values: [] };
    elem.id = id;
    if (data != null){
        for (let i = 0; i < 12; i++)
            elem.values.push({
                'date': new Date(2010, i, 1),
                'consumption': data[i]
            });
        this.data.push(elem);
    }

    this.showXticks = true;
    this.showYticks = true;
    this.num_x_ticks = 7;
    this.num_y_ticks = 3;
    this.color = "red";
}

LineChart.prototype = {
    constructor: LineChart,

    init: function(){
        let self = this,
            timeParser = d3.timeParse("%Y%m%d"),
            formatter = d3.format(".2s");

        self.min = Number.MAX_VALUE;
        self.max = 0;

        for (let i = 0; i < self.data.length; i++)
            for (let j = 0; j < self.data[i].values.length; j++){
                if (self.data[i].values[j].consumption > self.max)
                    self.max = self.data[i].values[j].consumption;
                if (self.data[i].values[j].consumption < self.min)
                    self.min = self.data[i].values[j].consumption;
            }

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
                .tickValues([new Date(2010, 0 , 1), new Date(2010, 11, 1)])
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
            .attr("class", function(d) {
                return "line path-linechart line" + d.id; 
            })
            .attr("d", function(d) { 
                return line(d.values); })
            .style("stroke", (d, i) => {
                let index = i % self.colors.length;
                return self.colors[index];
            });

        let consumption_unit = "electricity in kWh";
        if (self.energy == "gas") consumption_unit = "gas in thm";

        g.append("text")
            .attr("class", "label path-scatter linechart-y-text")
            .attr("transform", "translate(-20,-20)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .text(consumption_unit);

        /*self.svg.append("text")
            .attr("class", "linechart-title")
            .attr("transform", "translate(" + self.width/2 + " ," + (self.height + 30)  + ")")
            .text(self.energy);*/

        // adding hovering 
        let focus = g.append("g")
            .attr("class", "x-hover-line hover-line focus")
            .attr("y1", 0)
            .attr("y2", self.height)
            .style("display", "none");

        focus.append("line")
            .attr("class", "x-hover-line hover-line")
            .attr("y1", 0)
            .attr("y2", self.height);

        /*
        focus.append("line")
            .attr("class", "y-hover-line hover-line")
            .attr("x1", self.width)
            .attr("x2", self.width);
*/
        focus.append("circle")
            .attr("r", 3);

        for (let i = 0; i < self.data.length; i++)
            focus.append("text").attr("class", "linechart-hover-text").attr("dy", ".31em");

        self.svg.append("rect")
            .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
            .attr("class", "overlay")
            .attr("width", self.width)
            .attr("height", self.height)
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove);

        var bisectDate = d3.bisector(function(d) { return d.date; }).left;
        var f = d3.format(".2s");
        var mlist = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

        function mousemove() {
            if (self.data.length > 0){
              var x0 = x.invert(d3.mouse(this)[0]),
                  i = bisectDate(self.data[0].values, x0, 1),
                  d0 = self.data[0].values[i - 1],
                  d1 = self.data[0].values[i],
                  d = x0 - d0.date > d1.date - x0 ? d1 : d0,
                  j = x0 - d0.date > d1.date - x0 ? i : i - 1;
              
              focus.attr("transform", "translate(" + x(d.date) + "," + y(d.consumption) + ")");
              focus.selectAll("text")
                .text(function(e, i) { 
                    return mlist[self.data[i].values[j].date.getMonth()] + ": " + f(self.data[i].values[j].consumption); 
                }).attr("transform", function(e, i) {
                    let y_mov = 0;
                    if (i > 0)
                        y_mov = y(self.data[i].values[j].consumption) - y(d.consumption);
                    return "translate(0," + y_mov + ")";
                });
              if (x(d.date) > self.width / 2)
                focus.selectAll("text").style("text-anchor", "end").attr("x", -10);
              else focus.selectAll("text").style("text-anchor", "start").attr("x", 10);

              focus.select(".x-hover-line").attr("y2", self.height - y(d.consumption));
              //focus.select(".y-hover-line").attr("x2", self.width + self.width);
            }
        }
    },

    addDataItem: function(id, item) {

        let elem = { values: [] };
        elem.id = id;
        for (let i = 0; i < 12; i++)
            elem.values.push({
                'date': new Date(2010, i, 1),
                'consumption': item[i]
            });
        this.data.push(elem);

    },

    highlight: function(id) {
        this.svg.select(".line" + id).classed("linechart-highlight", true);
    },

    resetHighlight: function() {
        this.svg.select(".linechart-highlight").classed("linechart-highlight", false);
    }
}