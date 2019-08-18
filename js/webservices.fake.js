(function($) {
  var fake = $.ajax.fake;

  fake.registerWebservice('/get/usage/overview/data', function(data) {
    return [
      [
        {
          'name': 'text',
          'value': 11025
        },
        {
          'name': 'voice',
          'value': 4231
        },
        {
          'name': 'unused',
          'value': 12744
        }
      ],
      [
        {'serviceStart': 1451671200},
        {'unlimited': false}
      ]
    ];
  });
})(jQuery);

(function($) {
  var fake = $.ajax.fake;

  fake.registerWebservice('/get/usage/detail/data', function(data) {
    return [
      [
        {
          'label': 'Successful',
          'value': 15000,
          'name': 'successful'
        },
        {
          'label': 'With Errors',
          'value': 400,
          'name': 'with-errors'
        },
        {
          'label': 'Canceled',
          'value': 200,
          'name': 'canceled'
        },
        {
          'label': 'Opted Out',
          'value': 3000,
          'name': 'opted-out'
        }
      ],
      [25000]
    ];
  });
})(jQuery);


(function($) {
  var fake = $.ajax.fake;

  fake.registerWebservice('/get/usage/timeview/30dUsage', function(data) {
    return [
      [
        {
          "date":"2014-12-20",
          "text":0,
          "voice": 0
        },
        {
          "date":"2014-12-21",
          "text":38,
          "voice": 35
        },
        {
          "date":"2014-12-22",
          "text":0,
          "voice": 0
        },
        {
          "date":"2014-12-23",
          "text":123,
          "voice": 20
        },
        {
          "date":"2014-12-24",
          "text":30,
          "voice": 69
        },
        {
          "date":"2014-12-25",
          "text":15,
          "voice": 5
        },
        {
          "date":"2014-12-26",
          "text":0,
          "voice": 0
        },
        {
          "date":"2014-12-27",
          "text":0,
          "voice": 0
        },
        {
          "date":"2014-12-28",
          "text":38,
          "voice": 23
        },
        {
          "date":"2014-12-29",
          "text":21,
          "voice": 12
        },
        {
          "date":"2014-12-30",
          "text": 35,
          "voice": 20
        },
        {
          "date":"2014-12-31",
          "text":40,
          "voice": 30
        },
        {
          "date":"2015-01-01",
          "text":50,
          "voice": 14
        },
        {
          "date":"2015-01-02",
          "text":1,
          "voice": 2
        },
        {
          "date":"2015-01-03",
          "text":0,
          "voice": 0
        },
        {
          "date":"2015-01-04",
          "text":21,
          "voice": 12
        },
        {
          "date":"2015-01-05",
          "text":26,
          "voice": 29
        },
        {
          "date":"2015-01-06",
          "text":38,
          "voice": 30
        },
        {
          "date":"2015-01-07",
          "text":61,
          "voice": 10
        },
        {
          "date":"2015-01-08",
          "text":32,
          "voice": 0
        },
        {
          "date":"2015-01-09",
          "text":0,
          "voice": 0
        },
        {
          "date":"2015-01-10",
          "text":0,
          "voice": 0
        },
        {
          "date":"2015-01-11",
          "text":53,
          "voice": 0
        },
        {
          "date":"2015-01-12",
          "text":43,
          "voice": 15
        },
        {
          "date":"2015-01-13",
          "text":27,
          "voice": 60
        },
        {
          "date":"2015-01-14",
          "text":21,
          "voice": 20
        },
        {
          "date":"2015-01-15",
          "text":63,
          "voice": 50
        },
        {
          "date":"2015-01-16",
          "text":0,
          "voice": 0
        },
        {
          "date":"2015-01-17",
          "text":0,
          "voice": 0
        },
        {
          "date":"2015-01-18",
          "text":21,
          "voice": 39
        }
      ],
      ["2015-01-05"]
    ];
  });
})(jQuery);

(function($) {
  var fake = $.ajax.fake;

  fake.registerWebservice('/get/usage/timeview/12mUsage', function(data) {
    return [
      [
        {
          "date": "2014-02-01",
          "text": 0,
          "voice": 0
        },
        {
          "date": "2014-03-01",
          "text": 380,
          "voice": 350
        },
        {
          "date": "2014-04-01",
          "text": 21,
          "voice": 11
        },
        {
          "date": "2014-05-01",
          "text": 430,
          "voice": 200
        },
        {
          "date": "2014-06-01",
          "text": 340,
          "voice": 169
        },
        {
          "date": "2014-07-01",
          "text": 0,
          "voice": 0
        },
        {
          "date": "2014-08-01",
          "text": 600,
          "voice": 201
        },
        {
          "date": "2014-09-01",
          "text": 328,
          "voice": 192
        },
        {
          "date": "2014-10-01",
          "text": 380,
          "voice": 230
        },
        {
          "date": "2014-11-01",
          "text":80,
          "voice": 20
        },
        {
          "date": "2014-12-01",
          "text": 350,
          "voice": 200
        },
        {
          "date": "2015-01-01",
          "text": 410,
          "voice": 300
        }
      ],
      ["2015-01-05"]
    ];
  });
})(jQuery);

(function($) {
  var fake = $.ajax.fake;

  fake.registerWebservice('/get/usage/timeview/allUsage', function(data) {
    return [
      [
        {
          "date":"2010-01-01",
          "text": 0,
          "voice": 0
        },
        {
          "date":"2011-01-01",
          "text":1030,
          "voice": 994
        },
        {
          "date":"2012-01-01",
          "text":2030,
          "voice": 1294
        },
        {
          "date":"2013-01-01",
          "text":3459,
          "voice": 1405
        },
        {
          "date":"2014-01-01",
          "text":3800,
          "voice": 3500
        },
        {
          "date":"2015-01-01",
          "text":1029,
          "voice": 1638
        }
      ],
      ["2015-01-05"]
    ];
  });
})(jQuery);
