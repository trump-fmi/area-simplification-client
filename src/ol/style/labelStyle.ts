namespace ol.style {
    export function labelStyle(feature: any, resolution: any) {
        //Create new label
        var label = new ol.Label(feature, resolution);
        return label.render();
    }
}