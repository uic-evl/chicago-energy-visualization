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
		//.2s
		let self = this,
			f = d3.format(","),
			f2 = d3.format(",.2f"),
			view_model = {
				community: ko.observable(self.data.NAME),
				electricity: ko.observable(f(self.data.TOTAL_KWH) + " kWh"),
				gas: ko.observable(f(self.data.TOTAL_THERMS) + " thm"),
				population: ko.observable(f(self.data.TOTAL_POPULATION)),
				total_units: ko.observable(f(self.data.TOTAL_UNITS)),
				occupied_units: ko.observable(f(self.data.OCCUPIED_UNITS)),
				kwh_sqft: ko.observable(f2(self.data.KWH_TOTAL_SQFT)),
				therm_sqft: ko.observable(f2(self.data.THERMS_TOTAL_SQFT)),
				electricity_per_capita: ko.observable(f2(self.data.KWH_TOTAL_CAPITA)),
				gas_per_capita: ko.observable(f2(self.data.THERMS_TOTAL_CAPITA))
			}
		return view_model;
	},

	bindDataToView: function(view_model) {
		let self = this;
		$("#" + self.container_id).load("../view/Details2.html", (data) => {
            ko.cleanNode($("." + self.container_class)[0]);
            ko.applyBindings(view_model, $("." + self.container_class)[0]);
        });
	},

	updateElectricityLineChart:  function() {
		let chart = new LineChart("selected-linechart-electricity", "electricity", this.data.electricity);
		chart.margin.left = 45;
		chart.margin.right = 20;
		chart.color = "#e41a1c";
		chart.init();
	},

	updateGasLineChart: function() {
		let chart = new LineChart("selected-linechart-gas", "gas", this.data.gas);
		chart.margin.left = 45;
		chart.margin.right = 20;
		chart.color = "#377eb8";
		chart.init();
	},

	updateRankingPCP: function() {

	}
}