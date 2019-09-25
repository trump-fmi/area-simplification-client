namespace ol.style {

    //Basic style to use for arc labels
    const ARC_LABEL_STYLE = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'darkgreen',
            width: 5
        }),
        text: new ol.style.Text({
            font: 'bold 50px "Lucida Console", "Courier", "Arial Black"',
            placement: 'line',
            stroke: new ol.style.Stroke({
                color: 'black',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'white'
            }),
            rotateWithView: false,
            text: ''
        })
    });

    //Empty style which does not do anything
    const EMPTY_STYLE = new ol.style.Style({});

    /**
     * StyleFunction that returns the style to use for a certain arc label at a certain resolution.
     *
     * @param feature The feature to return the styles for
     * @param resolution The resolution to use
     */
    export function arcLabelStyleFunction(feature: Feature, resolution: number): ol.style.Style {
        //Get label name for this feature
        let labelName = feature.get("text");

        //Get style text object
        let textObject = ARC_LABEL_STYLE.getText();

        //Sanity check
        if (textObject == null) {
            return EMPTY_STYLE;
        }

        //Set style text
        textObject.setText(labelName);

        let arcHeight = feature.get("arc_height");
        if (arcHeight) {
            let height = arcHeight / resolution;
            textObject.setFont('bold ' + height + 'px "Lucida Console", "Courier", "Arial Black"');
        }

        //TODO
        ARC_LABEL_STYLE.setStroke(null);

        return ARC_LABEL_STYLE;
    }
}