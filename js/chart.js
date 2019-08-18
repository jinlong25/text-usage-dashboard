//set up namespace
if (!window.db) {
	window.db = {};
}

if (!window.db.stats) {
	window.db.textVoiceStats = {};
}

window.db.textVoiceStats.data = {};

window.db.textVoiceStats.createSVG = function(chart, className) {
	var svg = d3.select(className).append('svg')
							.attr('width', chart.w + chart.left + chart.right)
							.attr('height', chart.h + chart.top + chart.bottom)
							// .attr('viewBox', "0 0 " + (chart.w + chart.left + chart.right) + " " + (chart.h + chart.top + chart.bottom))
							// .attr("preserveAspectRatio", "xMidYMid meet")
							.append('g')
							.attr('transform', 'translate(' + chart.left + ',' + chart.top + ')');
	return svg;
};

window.db.textVoiceStats.d = document;
window.db.textVoiceStats.e = window.db.textVoiceStats.d.documentElement;
window.db.textVoiceStats.g = window.db.textVoiceStats.d.getElementsByTagName('body')[0];