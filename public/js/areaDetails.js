function AreaDetails(container_id, container_class, data){
	this.container_id = container_id;
	this.container_class = container_class;
	this.data = data;
}

AreaDetails.prototype = {
	constructor: AreaDetails,

	init: function() {
		let self = this,
			view_model = self.getViewModel();

		self.bindDataToView(view_model);
	},

	update: function(data) {
		let self = this;
		self.data = data;
		view_model = self.getViewModel();
		self.bindDataToView(view_model);
	},

	getViewModel: function(){
		let self = this,
			f = d3.format(".2s"),
			view_model = {
				community: ko.observable(self.data.NAME),
				electricity: ko.observable(f(self.data.TOTAL_KWH) + "W"),
				gas: ko.observable(f(self.data.TOTAL_THERMS) + "Thm"),
				population: ko.observable(f(self.data.TOTAL_POPULATION)),
				total_units: ko.observable(f(self.data.TOTAL_UNITS)),
				occupied_units: ko.observable(f(self.data.OCCUPIED_UNITS)),
				kwh_sqft: ko.observable(f(self.data.KWH_TOTAL_SQFT)),
				therm_sqft: ko.observable(f(self.data.THERMS_TOTAL_SQFT))
			}
		return view_model;
	},

	bindDataToView: function(view_model) {
		let self = this;
		$("#" + self.container_id).load("../view/Details.html", (data) => {
            ko.cleanNode($("." + self.container_class)[0]);
            ko.applyBindings(view_model, $("." + self.container_class)[0]);
        });
	},

	updateElectricityLineChart:  function() {
		let chart = new LineChart("selected-linechart-electricity", "electricity", this.data.electricity);
		chart.margin.left = 30;
		chart.margin.right = 10;
		chart.color = "#e41a1c";
		chart.init();
	},

	updateGasLineChart: function() {
		let chart = new LineChart("selected-linechart-gas", "gas", this.data.gas);
		chart.margin.left = 30;
		chart.margin.right = 10;
		chart.color = "#377eb8";
		chart.init();
	},

	updateRankingPCP: function() {

	}
}