//import the data from the .csv file
d3.json('./perCapitaLandUseRequirements.json', function(dataIn){

    console.log(dataIn);

    //set up initial crossfilter - this just takes a look at the data and catalogs it to make things more efficient
    var cf = crossfilter(dataIn);

    //add a "dimension" to filter by, and tell it what part of the object to look at (.countryCode, in this case)
    var byCountryCode = cf.dimension(function (d) {
        return d.countryCode;
    });

    //filter the data, returning everything with the country code "US". (Could also use this to get top 10, etc)
    var usData = byCountryCode.filterExact("US").top(Infinity);

    console.log(usData);


});
