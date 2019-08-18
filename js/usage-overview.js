window.db.textVoiceStats.drawUsageOverview = function() {
	//create a namespace
	//uo: usage-overview
	var uo = {
		w: 200,
		h: 200,
		top: 10,
		right: 10,
		bottom: 70,
		left: 10,
		duration: 1000,
		innerRadius: 80,
		outerRadius: 100,
		numFormatter: d3.format(','),
		dateFormatter: d3.time.format('%b.%e, %Y')
	};

	//create svg
	uo.svg = window.db.textVoiceStats.createSVG(uo, '.usage-overview');

	//define pie layout
	uo.pie = d3.layout.pie().sort(null).value(function(d) { return d.value; });

	//define arc
	uo.arc = d3.svg.arc()
							.innerRadius(uo.innerRadius)
							.outerRadius(uo.outerRadius);

	$.ajax({
		type: 'GET',
		dataType: 'jsonp',
		fake: true,
		url: '/get/usage/overview/data',
		success: function(data, textStatus) {
			//parse JSON data
			uo.data = data[0];
			uo.startingDate = new Date(parseInt(data[1][0].serviceStart)*1000);
			
			//remove unused usage if client is on unlimied plan
			if (data[1][1].unlimited === true) {
				uo.data.forEach(function(d) {
					if (d.name === 'unused') {
						d.value = 0;
					}
				});
			}

			//add init values for animation
			uo.data.forEach(function(d) { return d.init = 0; });

			//create color scale for hover state (different from css rules as the color for text needs to be darker)
			uo.colorHover = d3.scale.ordinal().domain(uo.data.map(function(d){ return d.name; }))
				.range(['#63c2cc', '#299cc4', '#888888']);

			//create group for each arc
			uo.groups = uo.svg.selectAll('g.group')
				.data(uo.pie(uo.data))
				.enter().append('g')
				.attr('class', function(d) { return 'group ' + d.data.name; })
				.attr('transform', 'translate(' + uo.outerRadius + ',' + uo.outerRadius + ')');

			//draw arcs
			uo.arcs = uo.groups.append('path')
				.attr('class', 'arc')
				.attr('name', function(d) { return d.data.name; })
				.attr('value', function(d) { return d.value; })
				.transition()
				.duration(uo.duration)
				.attrTween('d', tweenArc);

			//calculate total used
			uo.totalUsed = d3.sum(uo.data, function(d) {
				if(d.name != 'unused') {
					return d.value;
				}
			});

			//add center label
			uo.number = uo.svg.append('text')
				.attr('class', 'center-label number no-mouse')
				.attr('value', uo.totalUsed)
				.attr('x', uo.w/2)
				.attr('y', uo.h/2 - 10)
				.text(uo.numFormatter(uo.totalUsed))
				.transition()
				.duration(uo.duration)
				.style('opacity', 1);

			//insert subtitle
			uo.subtitle = uo.svg.append('text')
				.attr('class', 'center-label subtitle no-mouse')
				.attr('x', uo.w/2)
				.attr('y', uo.h/2 - 10);

			//add 'since'
			uo.svg.append('text')
				.attr('class', 'center-label since no-mouse')
				.attr('x', uo.w/2)
				.attr('y', uo.h/2 + 20)
				.text('since')
				.transition()
				.duration(uo.duration)
				.style('opacity', 1);

			//add service starting date
			uo.svg.append('text')
				.attr('class', 'center-label date no-mouse')
				.attr('x', uo.w/2)
				.attr('y', uo.h/2 + 40)
				.text(uo.dateFormatter(uo.startingDate))
				.transition()
				.duration(uo.duration)
				.style('opacity', 1);
				
			//add legend
			uo.svg.append('rect')
				.attr('class', 'legend voice')
				.attr('x', uo.w/2 - 40)
				.attr('y', uo.h + 20)
				.attr('width', 40)
				.attr('height', 5)
				.style('opacity', 0);
				
			uo.svg.append('text')
				.attr('class', 'legend voice')
				.attr('x', uo.w/2 - 37)
				.attr('y', uo.h + 38)
				.style('opacity', 0)
				.style('fill', '#2da8e0')
				.text('voice');
				
			uo.svg.append('rect')
				.attr('class', 'legend text')
				.attr('x', uo.w/2)
				.attr('y', uo.h + 20)
				.attr('width', 40)
				.attr('height', 5)
				.style('opacity', 0);
				
			uo.svg.append('text')
				.attr('class', 'legend text')
				.attr('x', uo.w/2 + 7)
				.attr('y', uo.h + 38)
				.style('opacity', 0)
				.style('fill', '#6bcbe8')
				.text('text');
				
			//fade in legend
			d3.selectAll('.legend')
				.transition()
				.delay(uo.duration/2)
				.duration(uo.duration)
				.style('opacity', 1);

			//add user interaction
			d3.selectAll('.arc').on('mouseover', function() {
				//extract values from object
				var thisName = d3.select(this).attr('name'),
					thisValue = d3.select(this).attr('value');

				//highlight selected arc
				d3.select(this).classed(thisName + '-hover', true);

				//update center label
				d3.select('.number')
					.transition()
					.duration(uo.duration/4)
					.attr('transform', 'translate(0, -20)')
					.style('fill', uo.colorHover(thisName))
					.tween('text', function() {
    				var i = d3.interpolate(this.textContent.replace(/,/g, ''), thisValue);
    				return function(t) {
							this.textContent = uo.numFormatter(Math.round(i(t)));
				    };
				  });

				//show subtitle
				uo.subtitle.transition()
					.delay(100)
					.duration(uo.duration/2)
					.text(thisName === 'unused' ? thisName : thisName + ' sent')
					.style('fill', uo.colorHover(thisName))
					.style('opacity', 1);

			}).on('mouseout', function() {
				//extract values from object
				var thisName = d3.select(this).attr('name');

				//dehighlight selected arc
				d3.select(this).classed(thisName + '-hover', false);

				//reset center label
				d3.select('.number')
					.transition()
					.duration(uo.duration/5)
					.attr('transform', 'translate(0, 0)')
					.style('fill', '#555')
					.tween('text', function() {
    				var i = d3.interpolate(this.textContent.replace(/,/g, ''), uo.totalUsed);
    				return function(t) {
							this.textContent = uo.numFormatter(Math.round(i(t)));
				    };
				  });

				//hide subtitle
				uo.subtitle.transition()
					.duration(uo.duration/5)
					.style('opacity', 0);
			});

			//define arcTween function
			//http://javascript.tutorialhorizon.com/2015/03/05/creating-an-animated-ring-or-pie-chart-in-d3js/
			function tweenArc(finish) {
				var start = {
					startAngle: 0,
					endAngle: 0
				};
				var i = d3.interpolate(start, finish);
				return function(d) { return uo.arc(i(d)); };
			}
		}
	})
}