namespace ol.geom {

    //Number of vertices to use for an arc line string
    const VERTICES_NUMBER = 32;

    /**
     * Represents line strings geometries that are aligned to an arc. Internally, a circle is created which is then
     * discretized to a line string with a certain number of vertices.
     */
    export class ArcLineString extends ol.geom.LineString {
        private _circleCentre: ol.Coordinate;
        private _radius: number;
        private _startAngle: number;
        private _endAngle: number;

        constructor(circleCentre: ol.Coordinate, radius: number, startAngle: number, endAngle: number, geometryLayout?: ol.geom.GeometryLayout) {

            super([], geometryLayout);

            this._circleCentre = circleCentre;
            this._radius = radius;
            this._startAngle = startAngle;
            this._endAngle = endAngle;

            this.generateVertices();
        }

        private generateVertices() {
            //Calculate vertices/radian ratio on a circle
            const VERTICES_PER_RADIAN = VERTICES_NUMBER / (2 * Math.PI);

            let circle = <ol.geom.Circle>new ol.geom.Circle(this._circleCentre, this._radius).transform('EPSG:4326', 'EPSG:3857');
            let circlePolygon = ol.geom.Polygon.fromCircle(circle, VERTICES_NUMBER, 0);

            let polygonCoordinates = circlePolygon.getCoordinates()[0];

            let vertex_start_index = 0, vertex_end_index = 0;

            if (this._startAngle >= 0) {
                vertex_start_index = Math.abs(this._startAngle) * VERTICES_PER_RADIAN;
            } else {
                vertex_start_index = VERTICES_NUMBER - this._startAngle * VERTICES_PER_RADIAN;
            }

            if (this._endAngle >= 0) {
                vertex_end_index = this._endAngle * VERTICES_PER_RADIAN;
            } else {
                vertex_end_index = VERTICES_NUMBER - Math.abs(this._endAngle) * VERTICES_PER_RADIAN;
            }

            vertex_start_index = Math.floor(vertex_start_index);
            vertex_end_index = Math.floor(vertex_end_index);

            let arcCoordinates = [];
            let addToList = false;

            //Iterate twice about all polygon vertices to get a transition between end and start
            for (let i = 0; i <= 2 * (VERTICES_NUMBER - 1); i++) {
                let localIndex = i % VERTICES_NUMBER;

                if (i === vertex_start_index) {
                    addToList = true;
                }

                if (addToList) {
                    arcCoordinates.push(polygonCoordinates[localIndex]);
                }

                if ((localIndex === vertex_end_index) && addToList) {
                    break;
                }
            }

            let layout = this.getLayout();
            this.setCoordinates(arcCoordinates, layout);
        }


        get circleCentre(): [number, number] {
            return this._circleCentre;
        }

        set circleCentre(value: [number, number]) {
            this._circleCentre = value;
        }

        get radius(): number {
            return this._radius;
        }

        set radius(value: number) {
            this._radius = value;
        }

        get startAngle(): number {
            return this._startAngle;
        }

        set startAngle(value: number) {
            this._startAngle = value;
        }

        get endAngle(): number {
            return this._endAngle;
        }

        set endAngle(value: number) {
            this._endAngle = value;
        }
    }
}