//Alias for typescript map
const TypedMap = Map;

namespace ol {
    /**
     * Calculate the min_t value from the resolution.
     * @param {number} resolution - current resolution
     */
    export function resolutionToMinT(resolution: number) {
        //Read required parameters
        //@ts-ignore
        var minTCoeff = window.minTCoeff || 1;
        //@ts-ignore
        var minTFac = window.minTFac || 9;

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
        //@ts-ignore
        var labelFacCoeff = window.labelFacCoeff || 1.1;

        return parseInt(labelFactor) * labelFacCoeff;
    }
}