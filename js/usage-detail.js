window.db.textVoiceStats.drawUsageDetail = function() {
	//create namespace
	//ud: usage detail
	var ud = {
		w: 790,
		h: 200,
		top: 10,
		right: 0,
		bottom: 70,
		left: 95,
		duration: 1000,
		numFormatter: d3.format(',')
	};

	var windowWidth = window.innerWidth || window.db.stats.e.clientWidth || window.db.stats.g.clientWidth;
	var windowHeight = window.innerHeight || window.db.stats.e.clientHeight || window.db.stats.g.clientHeight;

	if(windowWidth >= 768 & windowWidth < 1200) {
		ud.w = 600;
	} else if(windowWidth >= 500 & windowWidth < 768){
		ud.w = 300;
	} else if(windowWidth < 500) {
		ud.w = 160;
	}

	//create svg
	ud.svg = window.db.textVoiceStats.createSVG(ud, '.usage-detail');

	$.ajax({
		type: 'GET',
		dataType: 'jsonp',
		fake: true,
		url: '/get/usage/detail/data',
		success: function(data, textStatus) {
			//parse JSON data
			ud.data = data[0];
			ud.cap = data[1];

			//define color scale
			ud.color = d3.scale.ordinal().domain(ud.data.map(function(d){ return d.name; }))
				.range(['#30a469', '#97c754', '#f9d508', '#e07b36']);

			ud.colorHover = d3.scale.ordinal().domain(ud.data.map(function(d){ return d.name; }))
				.range(['#1f8e4b', '#8db83f', '#e4bb22', '#ce6a28']);

			//create scales
			ud.x = d3.scale.linear()
								.range([0, ud.w])
								.domain([0, ud.cap*1.1]);
			ud.y = d3.scale.ordinal()
								.rangeRoundBands([0, ud.h])
								.domain(ud.data.map(function(d) { return d.name; }));

			//draw background bars
			ud.backgroundBars = ud.svg.selectAll('rect.background-bar')
				.data(ud.data)
				.enter().append('rect')
				.attr('class', 'background-bar no-mouse')
				.attr('name', function(d) {
					return d.name;
				})
				.attr('width', ud.x(ud.cap))
				.attr('height', 40)
				.attr('x', 0)
				.attr('y', function(d) {
					return ud.y(d.name);
				})
				.attr('rx', 3)
				.attr('ry', 3)
				.transition()
				.duration(ud.duration)
				.style('opacity', 1);

			//draw labels
			ud.labels = ud.svg.selectAll('text.bar-label')
				.data(ud.data)
				.enter().append('text')
				.attr('class', function(d) {
					return 'bar-label no-mouse ' + d.name;
				})
				.attr('x', -10)
				.attr('y', function(d) {
					return ud.y(d.name) + 25;
				})
				.text(function(d) {
					return d.label;
				})
				.transition()
				.duration(ud.duration)
				.style('opacity', 1);

			//draw values
			ud.values = ud.svg.selectAll('text.value')
				.data(ud.data)
				.enter().append('text')
				.attr('class', function(d) {
					return 'value no-mouse ' + d.name;
				})
				.attr('x', ud.x(0) + 5)
				.attr('y', function(d) {
					return ud.y(d.name) + 25;
				})
				.text(function(d) {
					return ud.numFormatter(d.value);
				})
				.transition()
				.duration(ud.duration)
				.attr('x', function(d) {
					return ud.x(d.value) + 5;
				})
				.style('opacity', 1);

			//calculate total used
			ud.totalUsed = d3.sum(ud.data, function(d) { return d.value; });

			//draw pcts
			ud.pcts = ud.svg.selectAll('text.pct')
				.data(ud.data)
				.enter().append('text')
				.attr('class', function(d) {
					return 'pct no-mouse ' + d.name;
				})
				.attr('x', function(d) {
					return ud.x(d.value) + 40;
				})
				.attr('y', function(d) {
					return ud.y(d.name) + 25;
				})
				.text(function(d) {
					return Math.round(d.value/ud.totalUsed * 100) + '%';
				});

			//draw bars
			ud.bars = ud.svg.selectAll('rect.bar')
				.data(ud.data)
				.enter().append('rect')
				.attr('class', function(d) {
					return 'bar ' + d.name;
				})
				.attr('name', function(d) {
					return d.name;
				})
				.attr('width', 0)
				.attr('height', 40)
				.attr('x', 0)
				.attr('y', function(d) {
					return ud.y(d.name);
				})
				.attr('rx', 3)
				.attr('ry', 3)
				.attr('pointer-events', 'none')
				.style('fill', function(d) {
					return ud.color(d.name);
				})
				.transition()
				.duration(ud.duration)
				.attr('width', function(d) {
					return ud.x(d.value);
				});

			//add user interaction
			d3.selectAll('rect.background-bar')
				.on('mouseover', function() {
					//highlight current selected bar
					var thisName = d3.select(this).attr('name'),
						thisBar = d3.select('.bar.' + thisName);
					thisBar.style('fill', ud.colorHover(thisName));

					//hide values
					d3.select('text.value.' + d3.select(this).attr('name'))
						.style('opacity', 0);

					//show pcts
					d3.select('text.pct.' + d3.select(this).attr('name'))
						.transition()
						.duration(ud.duration/6)
						.attr('transform', 'translate(-35, 0)')
						.style('opacity', 1);

				}).on('mouseout', function() {
					//dehighlight current selected bar
					var thisName = d3.select(this).attr('name'),
						thisBar = d3.select('.bar.' + thisName);
					thisBar.style('fill', ud.color(thisName));

					//show values
					d3.select('text.value.' + thisName)
						.transition()
						.duration(ud.duration/6)
						.style('opacity', 1);

					//hide pcts
					d3.select('text.pct.' + thisName)
						.transition()
						.duration(ud.duration/6)
						.attr('transform', 'translate(0, 0)')
						.style('opacity', 0);
				});

			//enable mouseover on background bars
			setTimeout(function() {
				d3.selectAll('.background-bar').classed('no-mouse', false);
			}, ud.duration);

			ud.updateUsageDetail = function() {
				var windowWidth = window.innerWidth || window.db.stats.e.clientWidth || window.db.stats.g.clientWidth;
				var windowHeight = window.innerHeight || window.db.stats.e.clientHeight || window.db.stats.g.clientHeight;

				if(windowWidth >= 1200) {
					ud.updateWidth(790);
				} else if(windowWidth >= 768 & windowWidth < 1200) {
					ud.updateWidth(600);
				} else if(windowWidth >= 500 & windowWidth < 768){
					ud.updateWidth(300);
				} else if(windowWidth < 500) {
					ud.updateWidth(160);
				}
			}

			ud.updateWidth = function(w) {
				//update svg width
				d3.select('.chart.usage-detail>svg').attr('width', w + ud.left + ud.right)

				//update x scale for usage detail chart
				ud.x.range([0, w]);

				//update background bar width
				d3.selectAll('.background-bar').attr('width', ud.x(ud.cap));

				//update value x position
				d3.selectAll('.value').attr('x', function(d) { return ud.x(d.value) + 5; });

				//update pct x position
				d3.selectAll('.pct').attr('x', function(d) { return ud.x(d.value) + 40; });

				//update bar width
				d3.selectAll('.bar').attr('width', function(d) { return ud.x(d.value); });
			}

			//Binding updateWindow to screen resize
			window.onresize = ud.updateUsageDetail;

		}
	});
}