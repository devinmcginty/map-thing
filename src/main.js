//  main.js

//  Global variable definitions
var drawerOpen = true;  //  Variable of the menu status (menu open = true)
var map;    //  Google maps object (the map itself)
var activeSite = "";    //  Active map marker
var markerList = {};
//  Google Maps marker icons
var INACTIVE_ICON = "./src/img/map_pin_gray.png";
var HOVER_ICON = "./src/img/map_pin_orange.png";
var ACTIVE_ICON = "./src/img/map_pin_red.png";
//  Google Maps Info Windows
var hoverInfoWin = new google.maps.InfoWindow();
var activeInfoWin = new google.maps.InfoWindow();

/// Initializes Google Map canvas object
//  Invoked on document ready on #mapCanvas div
function initializeMap() {
    //  Map options:
    //      No 45deg tilt on zoom
    var mapOptions = {
        // Currently defaults to center at Philadelphia
        center: new google.maps.LatLng(39.98,-75.17),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.TOP_CENTER
        },
        panControl: true,
        panControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
        },
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        scaleControl: true,
        overviewMapControl: true,
        overviewMapControlOptions: {
            opened: true,
            position: google.maps.ControlPosition.BOTTOM_RIGHT
        },
        tilt: 0
    };

    map = new google.maps.Map(
        document.getElementById('mapCanvas'), mapOptions
    );

    //  Map automatically switches to hybrid (roadmap + satellite) view at high zoom
    google.maps.event.addListener(map, "zoom_changed", function() {
        if (map.getZoom() >= 16)
            map.setMapTypeId(google.maps.MapTypeId.HYBRID);
        else
            map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    });
}

/// Creates HTML for an individual sidebar button
function generateButtonHTML(siteID) {
    var br = "<br />";  //  HTML linebreak
    var site = MAP_SITES[siteID];
    var div = "<div class=\"sidebarButton\" id=\"";
    div += siteID;
    div += "\" onmouseover=\"hoverSite('";
    div += siteID;
    div += "');\" onmouseout=\"mouseoutSite('";
    div += siteID;
    div += "')\" onclick=\"activateSite('";
    div += siteID + "')\">\n";
    div += site.name + br;
    div += site.address + br;
    div += site.phone + br;
    div += "</div>";
    return div;
}

/// Populates sidebar and creates site markers on map
function parseSites() {
    var sidebarHTML = "";
    for (var siteID in MAP_SITES) {
        sidebarHTML += generateButtonHTML(siteID);
        createMapMarker(siteID);
    }
    document.getElementById("sidebar").innerHTML += sidebarHTML;
}

/// Highlights sidebar button and site marker with infoWindow on hover
function hoverSite(siteID) {
    if (activeSite !== siteID) {
        $("#" + siteID).addClass("hoverButton");
        if (map.getZoom() < 18) {
            marker = markerList[siteID];
            marker.setIcon(HOVER_ICON);
            marker.setOpacity(1);
            marker.setZIndex(1);
            hoverInfoWin.setContent(MAP_SITES[siteID].name);
            hoverInfoWin.open(map, marker);
        }
    }
}

/// Removes infoWindo and highlight on sidebar button and site marker from hoverSite()
function mouseoutSite(siteID) {
    $("#" + siteID).removeClass("hoverButton");
    if (activeSite !== siteID) {
        if (activeSite.length !== 0) {
            map.panTo(markerList[activeSite].getPosition());
        }
        marker = markerList[siteID];
        marker.setIcon(INACTIVE_ICON);
        marker.setOpacity(0.6);
        marker.setZIndex(0);
        hoverInfoWin.close();
    }
}

/// Highlights active sidebar button and shows active site information on map
function activateSite(siteID) {
    if (activeSite !== siteID) {
        var formerSite = activeSite;
        activeSite = siteID;
        if (formerSite.length !== 0 && formerSite !== activeSite){
            mouseoutSite(formerSite);
        }
        //  Set div style
        $(".activeButton").removeClass("activeButton");
        $("#" + siteID).addClass("activeButton");
        //  Set marker attributes
        marker = markerList[siteID];
        marker.setIcon(ACTIVE_ICON);
        marker.setOpacity(1);
        marker.setZIndex(2);
        //  Pan and zoom map
        map.panTo(marker.getPosition());
        if (map.getZoom() < 18) {
            map.setZoom(18);
        }
        //  Set info window
        var info = "<strong>" + MAP_SITES[siteID].name + "</strong>";
        activeInfoWin.setContent(info);
        activeInfoWin.open(map, marker);
    }
}

/// Creates Google Maps marker
function createMapMarker(siteID) {
    var site = MAP_SITES[siteID];
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(site.lat, site.lng),
        map: map,
        id: siteID,
        icon: INACTIVE_ICON,
        opacity: 0.6,
        zIndex: 0
    });
    //  Hash siteID to individual marker
    markerList[siteID] = marker;

    //  Create mouseover, mouseout, mouse click event listeners
    google.maps.event.addListener(marker, "mouseover", function(){
        hoverSite(siteID);
    });
    google.maps.event.addListener(marker, "mouseout", function(){
        mouseoutSite(siteID);
    });
    google.maps.event.addListener(marker, "click", function() {
        activateSite(siteID);
    });
}

//  Opens or closes sidebar menu when handle element is clicked
function toggleDrawer() {
    var drawerMargin = $("#sidebar").width();
    if (drawerOpen) {
        $("#sidebar").animate({marginLeft: -drawerMargin + "px"}, 300);
        $("#handle").animate({marginLeft: "20px"}, 300);
        document.getElementById("handle").innerHTML = "Open<br />Menu";
        drawerOpen = false;
    }
    else {
        $("#sidebar").animate({marginLeft: "0"}, 300);
        $("#handle").animate({marginLeft: drawerMargin + 20 + "px"}, 300);
        document.getElementById("handle").innerHTML = "Close<br />Menu";
        drawerOpen = true;
    }
}

$(document).ready(function() {
    initializeMap();
    parseSites();

    //  Initializes menu handle
    var $handle = $("#handle");
    $handle.disableSelection();
    $handle.draggable({
        axis: "y",
        containment: "#mapCanvas"
    });
    var sideWidth = $("#sidebar").width() + 20 + "px";
    $handle.css("marginLeft", sideWidth);
    document.getElementById("handle").innerHTML = "Close<br />Menu";

    //  Handle controls open/close of menu
    $handle.click( function() { toggleDrawer(); });

    //  Start active search box
    $("#searchBox").keyup( function() {
        var val = $.trim($(this).val()).replace(/ +/g, " ").toUpperCase();
        $(".sidebarButton").show().filter( function() {
            var text = $(this).text().replace(/\s+/g, " ").toUpperCase();
            return !~text.indexOf(val);
        }).hide();
    });
});
