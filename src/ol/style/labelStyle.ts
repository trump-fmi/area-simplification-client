namespace ol.style {
    export function labelStyle(feature: Feature, resolution: number) {
        //Create new label
        var label = new ol.Label(feature, resolution);
        return label.render();
    }
}