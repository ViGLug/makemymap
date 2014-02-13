Meteor.subscribe("markers");
Markers = new Meteor.Collection('markers');

Template.maptemplate.rendered = function() {
  // create a map in the "map" div, set the view to a given place and zoom
  var map = L.map('map').setView([45.500, 9.35], 10);

  // add an OpenStreetMap tile layer
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var query = Markers.find();
  var graphicalMarkers = {};
  query.observeChanges({
    added: function (id, pos) {
      graphicalMarker = L.marker([pos[0], pos[1]]);
      graphicalMarkers[id] = graphicalMarker;
      map.addLayer(graphicalMarker);
    },
    removed: function (id, pos) {
      map.removeLayer(graphicalMarkers[id]);
    }
  });
}

function sendLocation(position) {
  if (! Markers.find({'0':position.coords.latitude, '1':position.coords.longitude}).fetch().length) {
    Markers.insert([position.coords.latitude, position.coords.longitude]);
    alert("Posizione aggiunta");
  } else {
    alert("Posizione già presente");
  }
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      alert("Permesso negato")
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Informazione non disponibile");
      break;
    case error.TIMEOUT:
      alert("Timeout");
      break;
    case error.UNKNOWN_ERROR:
      alert("Impossibile localizzarti");
      break;
  }
}

function addPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(sendLocation, showError);
    } else {
      alert("Il tuo browser non supporta la geolocalizzazione");
    }
}

Template.buttons.events({
    'click #position':function(event, template) {
        addPosition();
    }
});

if (annyang) {
  var commands = {
    'aggiungi':addPosition,
  };

  annyang.debug();
  annyang.init(commands);
  annyang.setLanguage('it-IT');
  annyang.start();
}
