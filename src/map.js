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
    const { editor } = initEditor();
    const { map, drawnItems } = initMap({ editor });
    addMapBtns({ map, drawnItems, editor });
    loadExample({ map, drawnItems, editor });
    addEventListeners();
});

const initMap = ({ editor }) => {
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
            evt.popup.setContent(attachPopupContent({ layer, editor }));
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
            loadGeoJSON({ map, drawnItems, geoJSON, editor });
            errorLog.classList.add("hidden");
        } catch (e) {
            errorLog.classList.remove("hidden");
            errorLog.innerHTML = e.toString();
        }
    }, "Import As GeoJSON");
    control.addTo(map);
};

const loadGeoJSON = async ({ map, drawnItems, geoJSON, editor }) => {
    L.geoJSON(geoJSON, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup("", {
                maxHeight: "auto",
                maxWidth: "auto",
            });
            layer.on("popupopen", (evt) => {
                evt.popup.setContent(attachPopupContent({ layer, editor }));
            });
            drawnItems.addLayer(layer);
        },
    }).addTo(map);
};
const loadExample = async ({ map, drawnItems, editor }) => {
    const content = await fetch("../src/examples/ny-area.geojson").then(
        (resp) => {
            return resp.text();
        }
    );
    const geoJSON = JSON.parse(content);
    loadGeoJSON({ map, drawnItems, geoJSON, editor });
};

const attachPopupContent = ({ layer, editor }) => {
    const feature = layer.toGeoJSON();
    let polygon = turf.polygon(feature.geometry.coordinates);
    const sqMtrs = turf.area(polygon).toFixed(2);
    const sqFt = (sqMtrs * 10.7639).toFixed(2);
    const sqKm = (sqMtrs * 0.000001).toFixed(2);
    const sqMi = (sqMtrs * 0.0000003861).toFixed(2);
    const acres = (sqMtrs * 0.000247105).toFixed(2);
    const ha = (sqMtrs * 0.0001).toFixed(2);
    const content = document.createElement("div");
    const currentColor = layer.options.color;
    content.innerHTML = `
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
    <div class="flex flex-nowrap flex-row my-2 justify-between">
        <input type="color" id="feature-color" value="${currentColor}">
        <button type="button" 
            id="get-feature"
            class="change-feature-color bg-slate-600 px-2 text-white rounded-xl hover:bg-slate-500 active:bg-slate-700">
            Export feature
        </button>
        `;
    content
        .querySelector("#feature-color")
        .addEventListener("input", (event) => {
            layer.setStyle({ color: event.target.value });
        });
    content.querySelector("#get-feature").addEventListener("click", (event) => {
        editor.setValue(JSON.stringify(feature, null, "\t"));
    });
    return content;
};

const addEventListeners = () => {
    // document.addEventListener("click", (evt) => {
    //     let node = evt.target;
    //     while (node != undefined) {
    //         if (node.classList?.contains("change-feature-color")) {
    //             break;
    //         }
    //         node = node.parentNode;
    //     }
    // });
};
