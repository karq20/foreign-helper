var count = 0;

function validate(streetStr, cityStr) {    
    var streetStr = $('#street').val();
    var cityStr = $('#city').val();

    if (streetStr.length == 0 && cityStr.length == 0) {
        $('#street')
        .css({
            'border':'1px solid red'
        });

        $('#city')
        .css({
            "border":"1px solid red",
        });
        
        //if the previous error was a onlycityerror then remove 
        //that class, so that a fresh class can be added on error.
        $('#cityerr').removeClass('onlycityerror');

        //add error msg for street
        $('#strerr')
        .css({
            "display":"inline"
        })
        .text('Street Name is required!')
        .addClass('streetcityerror');
        
        if(count != 0) {
            $('#strerr').css('color','red');
        }

        $('#cityerr')
        .css({
            "display":"inline"
        })
        .text('City Name is required!')
        .addClass('streetcityerror');
        
        if(count != 0) {
            $('#cityerr').css('color','red');    
        }
            
                
        return false;
    } 
    else if (streetStr.length == 0 && cityStr.length != 0) {
        $('#street').css('border','1px solid red');
        $('#city').css("border","");
        
        //add error msg for street
        $('#strerr').append("<br>");
        
        $('#strerr').css("display","inline");
        $('#cityerr').css("display","none");

        $('#strerr').text('Street Name is required!');
        //add error class for street
        $('#strerr').addClass('streetcityerror');
        
        if(count != 0) {
            $('#strerr').css('color','red');            
        }
  /*      $('#street').css("color","black");*/
        return false;
    } 
    else if (streetStr.length != 0 && cityStr.length == 0) {
        $('#city').css("border","1px solid red");
        $('#street').css("border","");
        
        //add error msg for city
        $('#strerr').css("display","none");
        $('#cityerr').css("display","inline");
        $('#cityerr').text('City Name is required!');
        //add error class for street
        $('#cityerr').addClass('onlycityerror');
        
        if(count != 0) {
            $('#cityerr').css('color','red');            
        }
        /*$('#city').css("color","black");*/
        return false;
    }
    else {
        $('#street').css("border","");
        $('#city').css("border","");
        $('#strerr').css("display","none");
        $('#cityerr').css("display","none");
        count = 1;
        return true;
    }
}

function loadData() {
    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytCity = $('#nyt-city');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');
    var $weatherHeader = $('#weather-header');
    var $weatherInfo = $('#weather-info');
    

    // clear out old data before new request
    $wikiElem.text("");
    $nytElem.text("");
    
    var streetStr = $('#street').val();
    var cityStr = $('#city').val();

    if (validate(streetStr, cityStr)) {   //addon
        var address = streetStr + ', ' + cityStr;
        $greeting.text('So, you want to live at ' + address + '?');
 
        // LOAD STREETVIEW

        var streetviewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=600x400&location=' + address + '';
        $body.append('<img class="bgimg" src="' + streetviewUrl + '">');
        
        // LOAD NY TIMES

        var nytimesUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + cityStr + '&sort=newest&api-key=ef59e7aa1625ddc16d9bd7ee12f7ec65:19:73004334';
        
        $.getJSON(nytimesUrl, function(data){
                //Dynamic resize of NY Times container.

                var offset = $(".nytimes-container").offset();
                var nycont_ht = window.innerHeight - offset.top - 5;
                $('.nytimes-container').css('height', nycont_ht);

                $(".nytimes-container").css("overflow", "scroll");

            //Fetching data from NY Times API
            $nytHeaderElem.text('NY Times Articles About').append('<br><p>'+cityStr+'</p>');

            articles = data.response.docs;
            for (var i = 0; i < articles.length; i++) {
                var article = articles[i];
                $nytElem.append('<li class="article">'+
                    '<a href="'+article.web_url+'">'+article.headline.main+'</a>'+
                    '<p>' + article.snippet + '</p>'+ 
                '</li>');
            };
        
        }).error(function(e){
            $nytHeaderElem.text('New York Times Articles Could Not Be Loaded');
        });

        // LOAD WIKIPEDIA DATA

        var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + cityStr + '&format=json&callback=wikiCallback';
        var wikiRequestTimeout = setTimeout(function(){
            $wikiElem.text("failed to get wikipedia resources");
        }, 8000);

        $.ajax({
            url: wikiUrl,
            dataType: "jsonp",
            jsonp: "callback",
            success: function( response ) {
                var articleList = response[1];
                for (var i = 0; i < articleList.length; i++) {
                    articleStr = articleList[i];
                    var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                    $wikiElem.append('<li><a href="' + url + '">' + articleStr + '</a></li>');
                }
                clearTimeout(wikiRequestTimeout);
            }
        });

    } //addon

    return false;
};

function loadMap(){
    var streetStr = $('#street').val();
    var cityStr = $('#city').val();
    
    if (validate(streetStr, cityStr)) {   ////addon

        var address = streetStr + ', ' + cityStr;
        var gmapUrl = "http://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&sensor=false";

        $.ajax({
            url: gmapUrl,
            type : "POST",
            dataType: "json",
            cache: false,
            success: function(result){
                if(result.results.length){
                    var lat=result.results[0].geometry.location.lat;
                    var lon=result.results[0].geometry.location.lng;     
                    var latlng = new google.maps.LatLng(lat, lon);     
                    var mapOptions = {
                      zoom: 12,
                      center: latlng,
                      mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
                    var map = new google.maps.Map(document.getElementById("gmap"),mapOptions);
                    var marker = new google.maps.Marker({
                        position: result.results[0].geometry.location,
                        map: map,
                        title:address
                    });
                    google.maps.event.addListener(marker, 'click', function() {
                        infowindow.open(map,marker);
                    });
                    $('#gmap').css('height','400px');
                    $('#gmap').css('width','250px');
                }
            }
        });
    
    }  //addon

}

function weather() {
    var streetStr = $('#street').val();
    var cityStr = $('#city').val(); 
    var $weatherHeader = $('#weather-header');
    var $weatherInfo = $('#weather-info');
    var lat2 = 0, lon2 = 0;
    if (validate(streetStr, cityStr)) {

        //passing cityStr
        var weatherUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + cityStr + "&APPID=2ef9e90f8ea043df6d3ed60bd738a919";

        //callback function from ajax request
        /*setInterval(myTimer, 1000);*/
        $.getJSON( weatherUrl, function(response) {
            //clear previous data
            $('#weathernewinfo').remove();
            //change dimensions of div
            $('.weather-container').css('height','200px');
            $weatherHeader.text('Weather in ' + cityStr);
            $weatherHeader.css('color','blue');
            description = response.weather[0].description;
            temp = response.main.temp - 273;//subtract 273.15 to get celsius
            var temp_roundoff = Math.round(temp * 100) / 100;
            resplat = response.coord.lat;
            resplon = response.coord.lon;
            humidity = response.main.humidity;//add %
            $weatherInfo
            .append(
                '<p id="weathernewinfo"><b>Temperature: '+temp_roundoff+'&deg;C</b><br>' + 
                '<b>Humidity: '+humidity+'%</b><br>' + 
                '<b>Description: '+description+'</b></p>'
            );

        })
        .error(function(e){
            $weatherHeader.text('Weather Data Could Not Be Loaded');
        });



    }

}

/*    
    $.getJSON({
        url: gmapUrl,
        success: function(results, status) {
            var mapOptions = {
               	center:new google.maps.LatLng(0,0), 
               	zoom:12,
               	mapTypeControl: true,
	           	mapTypeControlOptions: {
      	    		style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
		        },
		        navigationControl: true,
               	mapTypeId:google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById("gmap"),mapOptions);
        }          
    });
*/

$(document).ready(function() {

    $('#form-container').submit(loadData);
    $('#form-container').submit(loadMap);
    $('#form-container').submit(weather);

});
