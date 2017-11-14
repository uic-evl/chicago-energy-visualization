function NomogramPanel(container, data) {
	this.container = container;
	this.data = data;
	this.months = ["Jan", "Feb", "Mar", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
}

NomogramPanel.prototype = {
	constructor: NomogramPanel,

	init: function(){
		let self = this;
		let myNomogram = new Nomogram()
							.data(self.data)
							.target("#" + self.container)
							.margins({
								top: 20,
								bottom: 50,
								left: 30,
								right: 30
							});
		
		let axes = [];
		for (let i = 0; i < 12; i++){
			axes.push({
				name: self.months[i],
				domain: ["1", "77"]
			});
		}
		myNomogram
			.setAxes(axes, "alter", "shrinkAxis")
			.titlePosition("bottom")
			.strokeWidth(1)
			.titleFontSize(10)
			.titleRotation(0)
			.tickFontSize(5);

		myNomogram.color("red").opacity(0.6);
		myNomogram.onMouseOver("hide-other").onMouseOut("reset-paths");
		myNomogram.draw();
	}
};