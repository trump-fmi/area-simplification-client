namespace ol {

    enum LabelType {
        ICON, TEXT
    }

    const ICON_MAPPING = new TypedMap<string, string>([
        ['aboriginal', 'religion/buddhist.svg'],
        ['administration', 'amenity/town_hall.svg'],
        ['airport', 'aerodrome.12.svg'],
        ['artgallery', 'tourism/artwork.svg'],
        ['assortment', 'religion/buddhist.svg'],
        ['atm', 'amenity/atm.svg'],
        ['bank', 'amenity/bank.svg'],
        ['bar', 'amenity/bar.svg'],
        ['bbq', 'tourism/picnic.svg'],
        ['beergarden', 'amenity/biergarten.svg'],
        ['bicycle_shop', 'shop/bicycle.svg'],
        ['boat', 'religion/buddhist.svg'],
        ['breastfeeding', 'religion/buddhist.svg'],
        ['bus', 'highway/bus_stop.12.svg'],
        ['cafeteria', 'shop/coffee.svg'],
        ['car', 'shop/car.svg'],
        ['car_share', 'amenity/rental_car.svg'],
        ['casino', 'religion/buddhist.svg'],
        ['catholicgrave', 'grave_yard_christian.svg'],
        ['church', 'religion/christian.svg'],
        ['cinema', 'amenity/cinema.svg'],
        ['clock', 'religion/buddhist.svg'],
        ['coffee', 'shop/coffee.svg'],
        ['communitycentre', 'amenity/community_centre.svg'],
        ['congress', 'amenity/town_hall.svg'],
        ['court', 'amenity/courthouse.svg'],
        ['dance_class', 'religion/buddhist.svg'],
        ['dancinghall', 'religion/buddhist.svg'],
        ['daycare', 'religion/buddhist.svg'],
        ['dentist', 'amenity/dentist.svg'],
        ['drinkingfountain', 'amenity/drinking_water.svg'],
        ['e-bike-charging', 'amenity/charging_station.svg'],
        ['fast_food', 'amenity/fast_food.svg'],
        ['ferry', 'amenity/ferry.svg'],
        ['fillingstation', 'amenity/fuel.svg'],
        ['firemen', 'amenity/firestation.svg'],
        ['firstaid', 'religion/buddhist.svg'],
        ['fountain', 'amenity/fountain.svg'],
        ['hospital', 'amenity/hospital.svg'],
        ['ice_cream', 'shop/ice_cream.svg'],
        ['library', 'amenity/library.svg'],
        ['market', 'shop/supermarket.svg'],
        ['medicalstore', 'amenity/pharmacy.svg'],
        ['medicine', 'amenity/pharmacy.svg'],
        ['music_classical', 'shop/musical_instrument.svg'],
        ['nursing_home_icon', 'religion/buddhist.svg'],
        ['parking', 'amenity/parking.svg'],
        ['parking_bicycle', 'amenity/bicycle_parking.svg'],
        ['perfumery', 'shop/perfumery.svg'],
        ['police', 'amenity/police.svg'],
        ['postal', 'amenity/post_office.svg'],
        ['restaurant', 'amenity/restaurant.svg'],
        ['sauna', 'religion/buddhist.svg'],
        ['school', 'religion/buddhist.svg'],
        ['spa', 'religion/buddhist.svg'],
        ['stripclub', 'religion/buddhist.svg'],
        ['taxi', 'amenity/taxi.svg'],
        ['telephone', 'amenity/telephone.svg'],
        ['theatre', 'amenity/theatre.svg'],
        ['toilets', 'amenity/toilets.svg'],
        ['tools', 'religion/buddhist.svg'],
        ['trash', 'amenity/waste_basket.svg'],
        ['undefined', 'religion/buddhist.svg'],
        ['university', 'religion/buddhist.svg'],
        ['veterinary', 'amenity/veterinary.svg'],
        ['waiting', 'amenity/bench.svg'],
        ['wifi', 'religion/buddhist.svg'],
        ['workoffice', 'religion/buddhist.svg']]);

    const ICON_URL = "https://raw.githubusercontent.com/gravitystorm/openstreetmap-carto/master/symbols/";

    export class Label {
        private static iconCache = new TypedMap<string, ol.style.Style>();
        private static textCache = new TypedMap<string, ol.style.Style>();

        private text: string;
        private feature: Feature;
        private t: number;
        private factor: number;
        private min_t: number;
        private type: LabelType;
        private iconUrl: string;

        constructor(feature: Feature, resolution: number) {
            // Get needed fields from feature object
            this.text = feature.get("name");
            this.feature = feature;
            this.t = feature.get("t");
            this.factor = feature.get("lbl_fac");

            //resolve if icon or text label
            this.resolveType();

            //get global min t
            this.min_t = ol.resolutionToMinT(resolution);
        }

        private resolveType() {
            if (this.text.includes('icon:')) {
                this.type = LabelType.ICON;
                var icon = this.text.replace('icon:', '');
                this.iconUrl = Label.getIconURL(icon);
            } else {
                this.type = LabelType.TEXT;
            }
        }

        public render(): ol.style.Style {
            // //basic settings of display
            var labelTextColor = '#fff';
            var labelBorderColor = '#333';
            var labelFontType = "Consolas";
            var labelCircleColor = "red";

            var style = null;

            //do not render if t value of feature is lower then current min_t
            if (this.min_t > this.t) {
                return null;
            }

            if (this.type == LabelType.ICON) {
                const cache_key = this.text;

                if (typeof Label.iconCache.get(cache_key) === 'undefined') {
                    style = new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                            crossOrigin: 'anonymous',
                            // size: [95, 95],
                            src: this.iconUrl
                        }))
                    });

                    Label.iconCache.set(cache_key, style);
                } else {
                    style = Label.iconCache.get(cache_key);
                }

            } else if (this.type == LabelType.TEXT) {

                // @ts-ignore
                var cache_key = window.debugDrawCirc ? this.text + ':debug' : this.text;


                if (typeof Label.textCache.get(cache_key) === 'undefined') {
                    var calculatedlabelFactor = ol.calculateLabelFactor(this.feature);
                    var fontConfig = calculatedlabelFactor + "px " + labelFontType;

                    // Remove escaped character from JSON format string: \\n to \n
                    if (this.text.indexOf("\\") >= 0) {
                        this.text = this.text.replace("\\n", "\n");
                    }

                    // Calculate the label size by the given value label factor
                    var maxLabelLength = Label.getMaxLabelLength(this.text);
                    var circleRadius = calculatedlabelFactor * maxLabelLength * 0.26;

                    var debugCircle = new ol.style.Circle({
                        radius: circleRadius,
                        stroke: new ol.style.Stroke({
                            color: labelCircleColor
                        })
                    });

                    var label = new ol.style.Text({
                        text: this.text,
                        font: fontConfig,
                        stroke: new ol.style.Stroke({
                            color: labelBorderColor,
                            width: 4
                        }),
                        fill: new ol.style.Fill({
                            color: labelTextColor
                        })
                    });

                    style = new ol.style.Style({
                        //@ts-ignore
                        image: window.debugDrawCirc == true ? debugCircle : null,
                        text: label
                    });

                    Label.textCache.set(cache_key, style);
                } else {
                    style = Label.textCache.get(cache_key);
                }
            }

            return style;
        }

        private static getIconURL(iconName: string): string {
            let icon = ICON_MAPPING.get('undefined');

            if (typeof ICON_MAPPING.get(iconName) !== 'undefined') {
                icon = ICON_MAPPING.get(iconName);
            }

            return ICON_URL + icon;
        }

        /**
         * Get max label length for the case that label has more than one row, e.g. Frankfurt\nam Main
         * @param {string} labelText - text of the label
         */
        private static getMaxLabelLength(labelText: string): number {
            var lines = labelText.split("\n");
            var maxLength = 0;
            var arrayLength = lines.length;

            for (var i = 0; i < arrayLength; i++) {
                if (maxLength < lines[i].length) {
                    maxLength = lines[i].length;
                }
            }
            return maxLength;
        }
    }
}