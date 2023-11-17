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
        const layer = e.layer;
        layer.bindPopup("", {
            maxHeight: "auto",
            maxWidth: "auto",
        });
        layer.on("popupopen", (evt) => {
            evt.popup.setContent(attachPopupContent(layer));
        });
        drawnItems.addLayer(layer);
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
            const geoJSON = JSON.parse(editor.getValue());
            loadGeoJSON({ map, drawnItems, geoJSON });
            errorLog.classList.add("hidden");
        } catch (e) {
            errorLog.classList.remove("hidden");
            errorLog.innerHTML = e.toString();
        }
    }, "Import As GeoJSON");
    control.addTo(map);
};

const loadGeoJSON = async ({ map, drawnItems, geoJSON }) => {
    L.geoJSON(geoJSON, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup("", {
                maxHeight: "auto",
                maxWidth: "auto",
            });
            layer.on("popupopen", (evt) => {
                evt.popup.setContent(attachPopupContent(layer));
            });
            drawnItems.addLayer(layer);
        },
    }).addTo(map);
};
const loadExample = async ({ map, drawnItems }) => {
    const content = await fetch("../src/examples/ny-area.geojson").then(
        (resp) => {
            return resp.text();
        }
    );
    const geoJSON = JSON.parse(content);
    loadGeoJSON({ map, drawnItems, geoJSON });
};

const attachPopupContent = (layer) => {
    const feature = layer.toGeoJSON();
    let polygon = turf.polygon(feature.geometry.coordinates);
    const sqMtrs = turf.area(polygon).toFixed(2);
    const sqFt = (sqMtrs * 10.7639).toFixed(2);
    const sqKm = (sqMtrs * 0.000001).toFixed(2);
    const sqMi = (sqMtrs * 0.0000003861).toFixed(2);
    const acres = (sqMtrs * 0.000247105).toFixed(2);
    const ha = (sqMtrs * 0.0001).toFixed(2);
    return `
        <div>
            <table>
                <tbody>
                    <tr class="odd:bg-white even:bg-gray-200">
                        <th class="font-bold whitespace-nowrap py-1 px-5">Sq. Meters</th>
                        <td>${sqMtrs}</td>
                    </tr>
                    <tr class="odd:bg-white even:bg-gray-200">
                        <th class="font-bold whitespace-nowrap py-1 px-5">Sq. Kilometers</th>
                        <td>${sqKm}</td>
                    </tr>
                    <tr class="odd:bg-white even:bg-gray-200">
                        <th class="font-bold whitespace-nowrap py-1 px-5">Sq. Feet</th>
                        <td>${sqFt}</td>
                    </tr>
                    <tr class="odd:bg-white even:bg-gray-200">
                        <th class="font-bold whitespace-nowrap py-1 px-5">Sq. Miles</th>
                        <td>${sqMi}</td>
                    </tr>
                    <tr class="odd:bg-white even:bg-gray-200">
                        <th class="font-bold whitespace-nowrap py-1 px-5">Acres</th>
                        <td>${acres}</td>
                    </tr>
                    <tr class="odd:bg-white even:bg-gray-200">
                        <th class="font-bold whitespace-nowrap py-1 px-5">Hectare</th>
                        <td>${ha}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        `;
};
