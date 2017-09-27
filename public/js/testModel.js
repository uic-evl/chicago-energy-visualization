const Test = function(){
	var self = {};
	var other = {};

	var a = 1;

	function printTest() {
		console.log(a);
	}

	return {
		print: printTest
	}
};

