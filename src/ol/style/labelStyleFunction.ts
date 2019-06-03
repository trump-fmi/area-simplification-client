namespace ol.style {
    export function labelStyleFunction(feature: Feature, resolution: number): ol.style.Style {
        //Create new label
        var label = new ol.Label(feature, resolution);
        return label.render();
    }
}