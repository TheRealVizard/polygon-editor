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
    const { editor } = initEditor();
    addMapBtns({ map, drawnItems, editor });
    loadExample({ map, drawnItems });
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

const initEditor = () => {
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/one_dark");
    editor.session.setMode("ace/mode/javascript");
    return { editor };
};

const addMapBtns = ({ map, drawnItems, editor }) => {
    const errorLog = document.getElementById("error-log");
    var control = new L.Control.Button(() => {
        try {
            drawnItems.addLayer(new L.GeoJSON(JSON.parse(editor.getValue())));
            errorLog.classList.add("hidden");
        } catch (e) {
            errorLog.classList.remove("hidden");
            errorLog.innerHTML = e.toString();
        }
    }, "Import As GeoJSON");
    control.addTo(map);
};

const loadExample = async ({ map, drawnItems }) => {
    const content = await fetch("../src/examples/ny-area.geojson").then(
        (resp) => {
            return resp.text();
        }
    );
    drawnItems.addLayer(new L.GeoJSON(JSON.parse(content)));
};
