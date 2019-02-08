(function(){

  var map = L.map('map', {
    center: [39.9522, -75.1639],
    zoom: 14
  });
  var Stamen_TonerLite = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
  }).addTo(map);

  /* =====================

  # Lab 2, Part 4 — (Optional, stretch goal)

  ## Introduction

    You've already seen this file organized and refactored. In this lab, you will
    try to refactor this code to be cleaner and clearer - you should use the
    utilities and functions provided by underscore.js. Eliminate loops where possible.

  ===================== */

  // Mock user input
  // Filter out according to these zip codes:
  var acceptedZipcodes = [19106, 19107, 19124, 19111, 19118];
  // Filter according to enrollment that is greater than this variable:
  var minEnrollment = 300;


  // clean data
  let zipSplit = (obj) => {
    if (typeof obj.ZIPCODE === 'string') {
      split = obj.ZIPCODE.split(' ');
      normalized_zip = parseInt(split[0]);
      obj.ZIPCODE = normalized_zip;
    }



    // If we have '19104 - 1234', splitting and taking the first (0th) element
    // as an integer should yield a zip in the format above


    // Check out the use of typeof here — this was not a contrived example.
    // Someone actually messed up the data entry
    if (typeof obj.GRADE_ORG === 'number') {  // if number
      obj.HAS_KINDERGARTEN = obj.GRADE_LEVEL < 1;
      obj.HAS_ELEMENTARY = 1 < obj.GRADE_LEVEL < 6;
      obj.HAS_MIDDLE_SCHOOL = 5 < obj.GRADE_LEVEL < 9;
      obj.HAS_HIGH_SCHOOL = 8 < obj.GRADE_LEVEL < 13;
    } else {  // otherwise (in case of string)
      obj.HAS_KINDERGARTEN = obj.GRADE_LEVEL.toUpperCase().indexOf('K') >= 0;
      obj.HAS_ELEMENTARY = obj.GRADE_LEVEL.toUpperCase().indexOf('ELEM') >= 0;
      obj.HAS_MIDDLE_SCHOOL = obj.GRADE_LEVEL.toUpperCase().indexOf('MID') >= 0;
      obj.HAS_HIGH_SCHOOL = obj.GRADE_LEVEL.toUpperCase().indexOf('HIGH') >= 0;
    }
  };

  _.each(schools, zipSplit);

  // filter data
  var filtered_data = [];
  var filtered_out = [];
  let filtering = (obj2) => {
    isOpen = obj2.ACTIVE.toUpperCase() == 'OPEN';
    isPublic = (obj2.TYPE.toUpperCase() !== 'CHARTER' ||
                obj2.TYPE.toUpperCase() !== 'PRIVATE');
    isSchool = (obj2.HAS_KINDERGARTEN ||
                obj2.HAS_ELEMENTARY ||
                obj2.HAS_MIDDLE_SCHOOL ||
                obj2.HAS_HIGH_SCHOOL);
    meetsMinimumEnrollment = obj2.ENROLLMENT > minEnrollment;
    meetsZipCondition = acceptedZipcodes.indexOf(obj2.ZIPCODE) >= 0;
    filter_condition = (isOpen &&
                        isSchool &&
                        meetsMinimumEnrollment &&
                        !meetsZipCondition);

    if (filter_condition) {
      filtered_data.push(obj2);
    } else {
      filtered_out.push(obj2);
    }
  }
  _.each(schools, filtering);

  console.log('Included:', filtered_data.length);
  console.log('Excluded:', filtered_out.length);

  // main loop
  var color;
  let mapping = (obj3) =>  {
    isOpen = obj3.ACTIVE.toUpperCase() == 'OPEN';
    isPublic = (obj3.TYPE.toUpperCase() !== 'CHARTER' ||
                obj3.TYPE.toUpperCase() !== 'PRIVATE');
    meetsMinimumEnrollment = obj3.ENROLLMENT > minEnrollment;

    // Constructing the styling  options for our map
    if (obj3.HAS_HIGH_SCHOOL){
      color = '#0000FF';
    } else if (obj3.HAS_MIDDLE_SCHOOL) {
      color = '#00FF00';
    } else {
      color = '##FF0000';
    }
    // The style options
    var pathOpts = {'radius': obj3.ENROLLMENT / 30,
                    'fillColor': color};
    L.circleMarker([obj3.Y, obj3.X], pathOpts)
      .bindPopup(obj3.FACILNAME_LABEL)
      .addTo(map);
  };
  _.each(filtered_data, mapping);

})();
