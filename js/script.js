function validate(streetStr, cityStr) {    
    var streetStr = $('#street').val();
    var cityStr = $('#city').val();

    if (streetStr.length == 0 && cityStr.length == 0) {
        $('#street')
        .css({
            'border':'2px solid red'
        });

        $('#city')
        .css({
            "border":"2px solid red",
        });
        //add error msg for street
        $('#cityerr').removeClass('onlycityerror');
        $('#strerr')
        .css({
            "display":"inline"
        })
        .text('Street Name is required!')
        .addClass('streetcityerror');

        $('#cityerr')
        .css({
            "display":"inline"
        })
        .text('City Name is required!')
        .addClass('streetcityerror');
                
        return false;
    } 
    else if (streetStr.length == 0 && cityStr.length != 0) {
        $('#street').css('border','2px solid red');
        $('#city').css("border","");
        
        //add error msg for street
        $('#strerr').append("<br>");
        
        $('#strerr').css("display","inline");
        $('#cityerr').css("display","none");

        $('#strerr').text('Street Name is required!');
        //add error class for street
        $('#strerr').addClass('streetcityerror');
  /*      $('#street').css("color","black");*/
        return false;
    } 
    else if (streetStr.length != 0 && cityStr.length == 0) {
        $('#city').css("border","2px solid red");
        $('#street').css("border","");
        
        //add error msg for city
        $('#strerr').css("display","none");
        $('#cityerr').css("display","inline");
        $('#cityerr').text('City Name is required!');
        //add error class for street
        $('#cityerr').addClass('onlycityerror');
        
        /*$('#city').css("color","black");*/
        return false;
    }
    else {
        $('#street').css("border","");
        $('#city').css("border","");
        $('#strerr').css("display","none");
        $('#cityerr').css("display","none");
        
        return true;
    }
}

function loadData() {
    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');
    // clear out old data before new request
    $wikiElem.text("");
    $nytElem.text("");
    
    var streetStr = $('#street').val();
    var cityStr = $('#city').val();

    if (validate(streetStr, cityStr)) {   //addon
        var address = streetStr + ', ' + cityStr;
        $greeting.text('So, you want to live at ' + address + '?');
 
        // load streetview
        var streetviewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=600x400&location=' + address + '';
        $body.append('<img class="bgimg" src="' + streetviewUrl + '">');
        
        // load nytimes
        var nytimesUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + cityStr + '&sort=newest&api-key=ef59e7aa1625ddc16d9bd7ee12f7ec65:19:73004334';
        $.getJSON(nytimesUrl, function(data){
            $nytHeaderElem.text('New York Times Articles About ' + cityStr);
            articles = data.response.docs;
            for (var i = 0; i < articles.length; i++) {
                var article = articles[i];
                $nytElem.append('<li class="article">'+
                    '<a href="'+article.web_url+'">'+article.headline.main+'</a>'+
                    '<p>' + article.snippet + '</p>'+
                '</li>');
            };
            $(".nytimes-container").css("height", "470px");
            $(".nytimes-container").css("overflow", "scroll");
        }).error(function(e){
            $nytHeaderElem.text('New York Times Articles Could Not Be Loaded');
        });

        // load wikipedia data
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
    else {

    }

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
                    lat=result.results[0].geometry.location.lat;
                    lng=result.results[0].geometry.location.lng;     
                    var latlng = new google.maps.LatLng(lat, lng);     
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
                    $('#gmap').css('height','350px');
                    $('#gmap').css('width','350px');
                }
            }
        });
    
    }  //addon

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

});
