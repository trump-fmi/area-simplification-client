namespace ol.style {
    //Minimum allowable label height
    const MIN_LABEL_HEIGHT = 20;

    //Generator for the arc labels font with parameter for text height
    const LABEL_FONT = (height: number) => `bold ${height}px "Lucida Console", "Courier", "Arial Black"`;


    //Basic style to use for arc labels
    const LABEL_STYLE = new ol.style.Style({
        text: new ol.style.Text({
            font: '',
            placement: 'line',
            stroke: new ol.style.Stroke({
                color: 'black',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'white'
            }),
            rotateWithView: false,
            text: '',
            textAlign: "center"
        })
    });

    //Stroke style for label boundaries
    const BOUNDARY_STYLE = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'darkgreen',
            width: 2
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
        let featureGeometry = feature.getGeometry();

        if (featureGeometry instanceof ol.geom.GeometryCollection) {
            //Return boundary style or empty style depending on user configuration
            return USER_CONFIG.drawLabelBoundaries ? BOUNDARY_STYLE : EMPTY_STYLE;
        } else if (!(featureGeometry instanceof ol.geom.ArcLineString)) {
            return EMPTY_STYLE;
        }

        //Get label name and arc height for this feature
        let labelName = feature.get("text");
        let arcHeight = feature.get("arc_height");

        //Get style text object
        let textObject = LABEL_STYLE.getText();

        //Set style text
        textObject.setText(labelName);

        //Check if height parameter is available
        if (arcHeight) {
            //Calculate font height
            let height = Math.floor(arcHeight / resolution);

            //Do not draw too small labels
            if (height < MIN_LABEL_HEIGHT) {
                return EMPTY_STYLE;
            }

            //Update font accordingly
            textObject.setFont(LABEL_FONT(height));
        }

        return LABEL_STYLE;
    }
}