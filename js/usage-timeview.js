window.db.textVoiceStats.drawUsageTimeview = function() {
	//create namespace
	//ut: usage timeview
	var ut = {
		w: 980,
		h: 180,
		top: 10,
		right: 25,
		bottom: 50,
		left: 80,
		duration: 1000,
		numFormatter: d3.format(','),
		dateParser: d3.time.format('%Y-%m-%d').parse,
		axisDateParser: {
			'30d': d3.time.format('%b.%e'),
			'12m': d3.time.format('%b. %Y'),
			'all': d3.time.format('%Y')
		},
		tooltipDateParser: {
			'30d': d3.time.format('%b.%e'),
			'12m': d3.time.format('%b. %Y'),
			'all': d3.time.format('%Y')
		}
	};

	//create svg
	ut.svg = window.db.textVoiceStats.createSVG(ut, '.usage-timeview');

	$.ajax({
		type: 'GET',
		dataType: 'jsonp',
		fake: true,
		url: '/get/usage/timeview/30dUsage',
		success: function(data, textStatus) {
			ut.data = data;
			
			//show btns
			d3.selectAll('.btn')
				.transition()
				.duration(ut.duration)
				.style('opacity', 1);

			//define x/y scales
			ut.x = d3.time.scale()
				.range([0, ut.w])
				.domain(d3.extent(ut.data[0], function(d) { return ut.dateParser(d.date); }));

			ut.y = d3.scale.linear()
				.range([0, ut.h])
				.domain([d3.max(ut.data[0], function(d) { return d.text + d.voice; }) * 2, 0]);

			//define keys
			ut.keys = d3.keys(ut.data[0][0]).filter(function(k) { return k !== 'date'; });

			//define area function
			ut.areaInit = d3.svg.area()
				.x(function(d) { return ut.x(ut.dateParser(d.date)); })
				.y0(function(d) { return ut.y(0); })
				.y1(function(d) { return ut.y(0); })
				.interpolate('monotone');

			ut.area = d3.svg.area()
				.x(function(d) { return ut.x(ut.dateParser(d.date)); })
				.y0(function(d) { return ut.y(d.y0); })
				.y1(function(d) { return ut.y(d.y0 + d.y); })
				.interpolate('monotone');

			//define stack layout
			ut.stack = d3.layout.stack()
				.values(function(d) { return d.values; });

			//refactor data for stacked area chart
			ut.stackedData = ut.stack(ut.keys.map(function(name) {
				return {
					name: name,
					values: ut.data[0].map(function(d) {
						return {date: d.date, y: d[name]};
					})
				}
			}));

			//define axes
			ut.xAxis = d3.svg.axis().scale(ut.x).orient('bottom').ticks(8)
				.tickFormat(ut.axisDateParser['30d']);

			ut.yAxis = d3.svg.axis().scale(ut.y).orient('left')
				.ticks(3).tickSize(-ut.w, 0, 0)
				.tickFormat(function(d) { return d === 0 ? '' : d; });

			//draw axes
			ut.svg.append('g')
				.attr('class', 'x axis')
				.attr('transform', 'translate(0, ' + ut.h + ')')
				.call(ut.xAxis);

			ut.svg.append('g')
				.attr('class', 'y axis')
				.call(ut.yAxis);

			//append a g for each series
			ut.series = ut.svg.selectAll('g.series')
				.data(ut.stackedData)
				.enter().append('g')
				.attr('class', 'series');

			//append a path for each series
			ut.paths = ut.series.append('path')
				.attr('class', function(d) {
					return d.name + ' area';
				})
				.attr('d', function(d) { return ut.areaInit(d.values); })
				.transition()
				.duration(ut.duration)
				.attr('d', function(d) { return ut.area(d.values); });

			//get the top series data
			ut.topSeriesData = ut.stackedData[ut.stackedData.length - 1].values;

			//draw selection-line
			ut.selectionLines = ut.svg.selectAll('line.selection-line')
				.data(ut.topSeriesData)
				.enter().append('line')
				.attr('class', 'selection-line')
				.attr('date', function(d){ return d.date; })
				.attr('x1', function(d) {
					return ut.x(ut.dateParser(d.date));
				})
				.attr('x2', function(d) {
					return ut.x(ut.dateParser(d.date));
				})
				.attr('y1', ut.y(0))
				.attr('y2', ut.y(d3.max(ut.data[0], function(d) { return d.text + d.voice; }) * 2));

			//draw dots
			ut.dots = ut.svg.selectAll('circle.dot.text')
				.data(ut.topSeriesData)
				.enter().append('circle')
				.attr('class', 'dot text')
				.attr('date', function(d){ return d.date; })
				.attr('cx', function(d) {
					return ut.x(ut.dateParser(d.date));
				})
				.attr('cy', function(d) {
					return ut.y(d.y0);
				})
				.attr('r', 1);

			ut.dots = ut.svg.selectAll('circle.dot.voice')
				.data(ut.topSeriesData)
				.enter().append('circle')
				.attr('class', 'dot voice')
				.attr('date', function(d){ return d.date; })
				.attr('cx', function(d) {
					return ut.x(ut.dateParser(d.date));
				})
				.attr('cy', function(d) {
					return ut.y(d.y + d.y0);
				})
				.attr('r', 1);

			//calculate bar width
			ut.barWidth = ut.w / (ut.topSeriesData.length - 1);

			//append selection bars
			ut.selectionBars = ut.svg.selectAll('rect.selection-bar')
				.data(ut.topSeriesData)
				.enter().append('rect')
				.attr('class', 'selection-bar')
				.attr('date', function(d){ return d.date; })
				.attr('text', function(d){ return d.y0; })
				.attr('voice', function(d){ return d.y; })
				.attr('width', ut.barWidth)
				.attr('height', ut.h)
				.attr('x', function(d) {
					return ut.x(ut.dateParser(d.date)) - ut.barWidth/2;
				})
				.attr('y', ut.y.domain()[1]);

			//append tooltip group
			ut.tooltip = ut.svg.append('g')
				.attr('class', 'info-window no-mouse')
				.style('opacity', 0);

			//draw tooltip window
			ut.tooltip.append('rect')
				.attr('class', 'tooltip-background')
				.attr('width', 150)
				.attr('height', 65)
				.attr('rx', 1)
				.attr('ry', 1)
				.style('fill-opacity', 0.8);

			//draw date
			ut.tooltip.append('text')
				.attr('class', 'timestamp')
				.attr('x', 75)
				.attr('y', 18);

			//draw legend
			ut.tooltip.selectAll('rect.legend')
				.data(ut.keys.reverse())
				.enter().append('rect')
				.attr('class', function(d) {
					return 'legend ' + d;
				})
				.attr('width', 10)
				.attr('height', 10)
				.attr('x', 24)
				.attr('y', function(d, i) {
					return i * 18 + 30;
				});

			//draw legend text
			ut.tooltip.selectAll('text.legend-text')
				.data(ut.keys)
				.enter().append('text')
				.attr('class', function(d) {
					return 'legend-text ' + d;
				})
				.attr('x', 39)
				.attr('y', function(d, i) {
					return i * 18 + 39;
				});

			//add user interaction to selection bars
			ut.selectionBars.on('mouseover', function() {
				//get current selected bar
				var thisBar = d3.select(this);

				//get data from current selected bar
				var thisTs = ut.tooltipDateParser['30d'](ut.dateParser(thisBar.attr('date'))),
					thisText = ut.numFormatter(thisBar.attr('text')),
					thisVoice = ut.numFormatter(thisBar.attr('voice'));

				//update tooltip info
				d3.select('.timestamp').text(thisTs);
				d3.select('.legend-text.text').text(thisText + ' text sent');
				d3.select('.legend-text.voice').text(thisVoice + ' voice sent');

				//highlight selection line
				var thisLine = d3.select('line[date="'+ thisBar.attr('date') +'"]').style('opacity', 0.5);

				//highlight dot
				d3.selectAll('circle[date="'+ thisBar.attr('date') +'"]')
					.transition()
					.ease('elastic')
					.duration(ut.duration)
					.attr('r', 5)
					.style('opacity', 0.5);

				//show tooltip
				d3.select('.info-window')
				.transition()
				.duration(ut.duration/5)
				.style('opacity', 1);
			})
			.on('mouseout', function() {
				//hide tooltip
				d3.select('.info-window')
				.transition()
				.duration(ut.duration/5)
				.style('opacity', 0);

				//dehighlight selection line
				d3.selectAll('line.selection-line').style('opacity', 0);

				//dehighlight dot
				d3.selectAll('circle.dot')
					.transition()
					.duration(100)
					.attr('r', 1)
					.style('opacity', 0);
			})
			.on('mousemove', function() {
				//conditional positioning of tooltip
				if (d3.mouse(this)[0] < ut.w - 150) {
					var trans = 'translate(' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1] + ')';
				} else {
					var trans = 'translate(' + (d3.mouse(this)[0] - 150).toString() + ',' + d3.mouse(this)[1] + ')';
				}

				//update tooltip position
				d3.select('.info-window')
					.attr('transform', trans);
			});
		}
	});
	
	//define button functions
	d3.selectAll('.btn').on('click', function() {
		//unselect all btns
		d3.selectAll('.btn').classed('btn-default', true);
		d3.selectAll('.btn').classed('btn-primary', false);
		
		//phase out current timeline data
		d3.selectAll('.area')
			.transition()
			.duration(ut.duration / 2)
			.attr('d', function(d) { return ut.areaInit(d.values); });
		
		//disable mouseover
		ut.selectionBars.classed('no-mouse', true);
		
		//remove series, selection lines, dots, bars
		d3.selectAll('.series,.selection-line,.dot,.selection-bar,.info-window')
			.transition()
			.delay(ut.duration / 2)
			.remove();
		
		//select this btn
		d3.select(this).classed('btn-primary', true);
		
		//get selected data
		ut.selectedData = d3.select(this).attr('data');
		
		//retrieve data
		$.ajax({
			type: 'GET',
			dataType: 'jsonp',
			fake: true,
			url: '/get/usage/timeview/' + ut.selectedData + 'Usage',
			success: function(data, textStatus) {
				ut.data = data;
				
				//update scales
				ut.x.domain(d3.extent(ut.data[0], function(d) {
					return ut.dateParser(d.date);
				}));
				
				ut.y.domain([d3.max(ut.data[0], function(d) { 
					return d.text + d.voice;
				}) * 2, 0]);
				
				//update axes
				ut.xAxis.scale(ut.x)
					.ticks(ut.selectedData === 'all' ? ut.data[0].length : 8)
					.tickFormat(ut.axisDateParser[ut.selectedData]);

				ut.yAxis = d3.svg.axis().scale(ut.y).orient('left')
					.ticks(3).tickSize(-ut.w, 0, 0)
					.tickFormat(function(d) { return d === 0 ? '' : d; });
					
				d3.select('.x.axis')
					.transition()
					.duration(ut.duration / 2)
					.call(ut.xAxis);
					
				d3.select('.y.axis')
					.transition()
					.duration(ut.duration / 2)
					.call(ut.yAxis);

				//update ut.stackedData
				ut.stackedData = ut.stack(ut.keys.map(function(name) {
					return {
						name: name,
						values: ut.data[0].map(function(d) {
							return {date: d.date, y: d[name]};
						})
					}
				}));
				
				//update ut.topSeriesData
				ut.topSeriesData = ut.stackedData[ut.stackedData.length - 1].values;
				
				//append a g for each series
				ut.series = ut.svg.selectAll('g.series')
					.data(ut.stackedData)
					.enter().append('g')
					.attr('class', 'series');

				//append a path for each series
				ut.paths = ut.series.append('path')
					.attr('class', function(d) {
						return d.name + ' area';
					})
					.attr('d', function(d) { return ut.areaInit(d.values); })
					.transition()
					.duration(ut.duration)
					.attr('d', function(d) { return ut.area(d.values); });

				//draw selectionLines
				ut.selectionLines = ut.svg.selectAll('line.selection-line')
					.data(ut.topSeriesData)
					.enter().append('line')
					.attr('class', 'selection-line')
					.attr('date', function(d){ return d.date; })
					.attr('x1', function(d) {
						return ut.x(ut.dateParser(d.date));
					})
					.attr('x2', function(d) {
						return ut.x(ut.dateParser(d.date));
					})
					.attr('y1', ut.y(0))
					.attr('y2', ut.y(d3.max(ut.data[0], function(d) { return d.text + d.voice; }) * 2));

				//draw dots
				ut.dots = ut.svg.selectAll('circle.dot.text')
					.data(ut.topSeriesData)
					.enter().append('circle')
					.attr('class', 'dot text')
					.attr('date', function(d){ return d.date; })
					.attr('cx', function(d) {
						return ut.x(ut.dateParser(d.date));
					})
					.attr('cy', function(d) {
						return ut.y(d.y0);
					})
					.attr('r', 1);

				ut.dots = ut.svg.selectAll('circle.dot.voice')
					.data(ut.topSeriesData)
					.enter().append('circle')
					.attr('class', 'dot voice')
					.attr('date', function(d){ return d.date; })
					.attr('cx', function(d) {
						return ut.x(ut.dateParser(d.date));
					})
					.attr('cy', function(d) {
						return ut.y(d.y + d.y0);
					})
					.attr('r', 1);

				//draw selection bars
				ut.barWidth = ut.w / (ut.topSeriesData.length - 1);

				ut.selectionBars = ut.svg.selectAll('rect.selection-bar')
					.data(ut.topSeriesData)
					.enter().append('rect')
					.attr('class', 'selection-bar')
					.attr('date', function(d){ return d.date; })
					.attr('text', function(d){ return d.y0; })
					.attr('voice', function(d){ return d.y; })
					.attr('width', ut.barWidth)
					.attr('height', ut.h)
					.attr('x', function(d) {
						return ut.x(ut.dateParser(d.date)) - ut.barWidth/2;
					})
					.attr('y', ut.y.domain()[1]);
				
				//append tooltip group
				ut.tooltip = ut.svg.append('g')
					.attr('class', 'info-window no-mouse')
					.style('opacity', 0);

				//draw tooltip window
				ut.tooltip.append('rect')
					.attr('class', 'tooltip-background')
					.attr('width', 150)
					.attr('height', 65)
					.attr('rx', 1)
					.attr('ry', 1)
					.style('fill-opacity', 0.8);

				//draw date
				ut.tooltip.append('text')
					.attr('class', 'timestamp')
					.attr('x', 75)
					.attr('y', 18);

				//draw legend
				ut.tooltip.selectAll('rect.legend')
					.data(ut.keys.reverse())
					.enter().append('rect')
					.attr('class', function(d) {
						return 'legend ' + d;
					})
					.attr('width', 10)
					.attr('height', 10)
					.attr('x', 24)
					.attr('y', function(d, i) {
						return i * 18 + 30;
					});

				//draw legend text
				ut.tooltip.selectAll('text.legend-text')
					.data(ut.keys)
					.enter().append('text')
					.attr('class', function(d) {
						return 'legend-text ' + d;
					})
					.attr('x', 39)
					.attr('y', function(d, i) {
						return i * 18 + 39;
					});
				
				//enable mousemover
				ut.selectionBars.on('mouseover', function() {
					//get current selected bar
					var thisBar = d3.select(this);

					//get data from current selected bar
					var thisTs = ut.tooltipDateParser[ut.selectedData](ut.dateParser(thisBar.attr('date'))),
						thisText = ut.numFormatter(thisBar.attr('text')),
						thisVoice = ut.numFormatter(thisBar.attr('voice'));

					//update tooltip info
					d3.select('.timestamp').text(thisTs);
					d3.select('.legend-text.text').text(thisText + ' text sent');
					d3.select('.legend-text.voice').text(thisVoice + ' voice sent');

					//highlight selection line
					var thisLine = d3.select('line[date="'+ thisBar.attr('date') +'"]').style('opacity', 0.5);

					//highlight dot
					d3.selectAll('circle[date="'+ thisBar.attr('date') +'"]')
						.transition()
						.ease('elastic')
						.duration(ut.duration)
						.attr('r', 5)
						.style('opacity', 0.5);

					//show tooltip
					d3.select('.info-window')
					.transition()
					.duration(ut.duration/5)
					.style('opacity', 1);
				})
				.on('mouseout', function() {
					//hide tooltip
					d3.select('.info-window')
					.transition()
					.duration(ut.duration/5)
					.style('opacity', 0);

					//dehighlight selection line
					d3.selectAll('line.selection-line').style('opacity', 0);

					//dehighlight dot
					d3.selectAll('circle.dot')
						.transition()
						.duration(100)
						.attr('r', 1)
						.style('opacity', 0);
				})
				.on('mousemove', function() {
					//conditional positioning of tooltip
					if (d3.mouse(this)[0] < ut.w - 150) {
						var trans = 'translate(' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1] + ')';
					} else {
						var trans = 'translate(' + (d3.mouse(this)[0] - 150).toString() + ',' + d3.mouse(this)[1] + ')';
					}

					//update tooltip position
					d3.select('.info-window')
						.attr('transform', trans);
				});
			}
		});
	});
	
	//create selection line
	//create selection dot
	//create selection bar
	//create tooltip
	//add mouseover to selection bar
}