// const options = {
// 	method: 'GET',
// 	headers: {
// 		'X-RapidAPI-Host': 'tasty.p.rapidapi.com',
// 		'X-RapidAPI-Key': '4e55798e4amshb2bd5f7a45adbd1p1e06e7jsna7426a55f7cd'
// 	}
// };

// fetch('https://tasty.p.rapidapi.com/recipes/list?from=0&size=20&tags=under_30_minutes&q=salad', options)
// 	.then(response => response.json())
//     .then(function(data){
//         console.log(data);
//         for(var j=0; j<3;j++){
//             //console.log(data.results[i].slug);
//             for(var i = 0; i < data.results[0].sections[1].components.length; i++){
//                // debugger;
//                 if(data.results[j].sections[1].components[i].measurements[0].unit.abbreviation){
//                     var units = data.results[j].sections[1].components[i].measurements[0].unit.abbreviation;
//                     console.log(units);
//             }
//                 else
//                     console.log("measurements doesn't exsist");
//                 if(data.results[j].sections[1].components[i].ingredient.name){
//                     var ingredient = data.results[j].sections[1].components[i].ingredient.name;
//                     console.log(ingredient);
//                 }
//                 else
//                     console.log("ingredient doesn't exsist");
//             }
//         }
//     })
var locationListEl = document.querySelector('#locatons-list');
var submitButton = document.querySelector('#search-nearby');
var zipInput = document.querySelector('#zipCode');
var infoWindow;
var currentInfoWindow;
var service;
var infoPane;
var latitude = '30.2672';
var longitude = '-97.7431';
var mapProp;
var map;
var pos = {
    lat: latitude,
    lng: longitude
}


//initializes the map
function myMap(){
    console.log("wheres my map");
    infoWindow = new google.maps.InfoWindow;
    currentInfoWindow = infoWindow;

    infoPane = document.getElementById('locations-list');
    //mapProp defines map properties to set up the parameters
    mapProp = {
        //using variables to have lat and lng be where user enters address
        //center: new google.maps.LatLng(lat,lng),
        center: new google.maps.LatLng(latitude,longitude),
        zoom:14
    };

    //creates a new map inside the div elment with the same ID
    map = new google.maps.Map(document.getElementById("googleMap"),mapProp);

    //event listener - runs a function to get the coordinates of the address entered.
    submitButton.addEventListener('submit', geoLocation);
    if(submitButton){
        pos = {
            lat: latitude,
            lng: longitude
        }
        infoWindow.setPosition(new google.maps.LatLng(latitude,longitude));
        infoWindow.setContent('Location found.');
        infoWindow.open(map);
    }
}

/*this function takes the input and uses Google Maps Geocoding API to get the given
address and convert them into latitude and longitude coordinates. This way we
can dynamically change where the maps is centered at*/
function geoLocation (){
    event.preventDefault();

    //store the users input into a variable
     var input = zipInput.value;

     //access the geocoding api to get coordinates
     var geocoder = new google.maps.Geocoder();
     geocoder.geocode({'address': 'zipcode' + input}, function(results,status){
         if (status == google.maps.GeocoderStatus.OK){
            latitude = results[0].geometry.location.lat();
            longitude = results[0].geometry.location.lng();
            //console.log(results);

            //this sets the new center of the map at the given address
            map.setCenter(new google.maps.LatLng(latitude, longitude));
            pos = {
                lat: latitude,
                lng: longitude
            }
            getNearbyPlaces(pos);
         }else{
             alert("request failed.")
         }
     });
     return;
}


//function to look for grocery stores nearby
function getNearbyPlaces(position){
    var request = {
        location: position,
        rankBy: google.maps.places.RankBy.Distance,
        keyword: 'grocery store',
        radius: 3000
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request,nearbyCallback);
}

//decide how many results to show
function nearbyCallback(results, status){
    if (status === google.maps.places.PlacesServiceStatus.OK){
       console.log(status + " " + google.maps.places.PlacesServiceStatus.OK);
        createMarkers(results);
    }
}

//set markers ath the location of each place result
function createMarkers(places){
    console.log(places);
    places.forEach(place =>{
        var marker = new google.maps.Marker({
            position : place.geometry.location,
            map:map,
            title:place.name
        });

        //Add event listeners to each marker to show details
        google.maps.event.addListener(marker, 'click', () => {
            var request = {
                placeId: place.place_id,
                fields: ['name', 'formatted_address', 'geometry',
                'website','photos']
            };

            ////only show details when click on marker
            service.getDetails(request,(placeResult, status) => {
                showDetails(placeResult, marker, status)
            });
        });
    });
}

function showDetails(placeResult, marker, status){
    if(status == google.maps.places.PlacesServiceStatus.OK){
        var placeInfoWindow = new google.maps.InfoWindow();
        placeInfoWindow.setContent('<div><strong>' + placeResult.name + '</strong><br>'
        + '</div>;');
        placeInfoWindow.open(marker.map, marker);
        currentInfoWindow.close();
        currentInfoWindow = placeInfoWindow;
        showPanel(placeResult);
    }else{
        console.log('showDetails failed: ' + status);
    }
}

function showPanel(placeResult){
    if(infoPane.classList.contains("open"))
        infoPane.classList.remove("open");

    while(infoPane.lastChild){
        infoPane.removeChild(infoPane.lastChild);
    }

    if(placeResult.photos){
        var firstPhoto = placeResult.photos[0];
        var photo = document.createElement('img');
        photo.classList.add('hero');
        photo.src = firstPhoto.getUrl();
        infoPane.appendChild(photo);
    }

    var name = document.createElement('h3');
    name.classList.add('place');
    name.textContent = placeResult.name;
    infoPane.appendChild(name);
    var address = document.createElement('p');
    address.classList.add('details');
    address.textContent = placeResult.formatted_address;
    infoPane.appendChild(address);
    if (placeResult.website) {
        let websitePara = document.createElement('p');
        let websiteLink = document.createElement('a');
        let websiteUrl = document.createTextNode(placeResult.website);
        websiteLink.appendChild(websiteUrl);
        websiteLink.title = placeResult.website;
        websiteLink.href = placeResult.website;
        websitePara.appendChild(websiteLink);
        infoPane.appendChild(websitePara);
    }

      infoPane.classList.add("open");
}




