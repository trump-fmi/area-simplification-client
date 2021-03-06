//Alias for typescript map
const TypedMap = Map;

namespace ol {

    /**
     * Defines the assumed structure of AreaType objects which describe area type.
     */
    export interface AreaType {
        labels: {
            "arced": boolean,
            "zoom_min": number,
            "zoom_max": number
        },
        resource: string,
        search_highlight: boolean,
        z_index: number,
        zoom_min: number,
        zoom_max: number
    }

    /**
     * Calculate the min_t value from the resolution.
     * @param {number} resolution - current resolution
     */
    export function resolutionToMinT(resolution: number) {
        //Read required parameters
        var minTCoeff = USER_CONFIG.minTCoeff || 1;
        var minTFac = USER_CONFIG.minTFactor || 22;

        //It's a kind of magic?
        var zoom = Math.log2(156543.03390625) - Math.log2(resolution);
        if (zoom <= 3) {
            return 10000;
        } else {
            return minTCoeff * Math.pow(2, minTFac - (zoom - 1));
        }
    }

    export function calculateLabelFactor(feature: Feature): number {
        var labelFactor = feature.get("lbl_fac");

        //Read required parameter
        var labelFacCoeff = USER_CONFIG.labelFactorCoeff || 1.1;

        return parseInt(labelFactor) * labelFacCoeff;
    }
}
