L.Control.Button = L.Control.extend({
    initialize: function (listener, name) {
        this.clickListener = listener;
        this.name = name;
    },
    options: {
        position: "topleft",
    },
    onAdd: function (map) {
        var container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
        var button = L.DomUtil.create("a", "leaflet-control-button", container);
        button.innerHTML = '<img src="./src/earth-globe.gif">';
        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.on(button, "click", this.clickListener);

        container.title = this.name;

        return container;
    },
    onRemove: function (map) {},
});

document.addEventListener("DOMContentLoaded", () => {
    const { map, drawnItems } = initMap();
    addMapBtns({map, drawnItems});
    loadExample({map, drawnItems});
});

const initMap = () => {
    const map = L.map("map").setView([40.689247, -74.044502], 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems,
        },
    });
    map.addControl(drawControl);

    map.on("draw:created", function (e) {
        drawnItems.addLayer(e.layer);
    });
    return { map, drawnItems };
};

const addMapBtns = ({ map, drawnItems }) => {
    var control = new L.Control.Button(() => {
        console.log("Test...");
    }, "Import GeoJSON");
    control.addTo(map);
};

const loadExample = async ({ map, drawnItems }) => {
    const content = await fetch(
        "../src/examples/ny-area.geojson"
    ).then((resp) => {
        return resp.text();
    });
    drawnItems.addLayer(new L.GeoJSON(JSON.parse(content)));
};
