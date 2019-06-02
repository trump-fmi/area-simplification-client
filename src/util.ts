const TypedMap = Map;

namespace ol{
    /**
     * Calculate the min_t value from the resolution.
     * @param {number} resolution - current resolution
     */
    export function resolutionToMinT(resolution:number) {
        var zoom = Math.log2(156543.03390625) - Math.log2(resolution);
        if (zoom <= 3) {
            return 10000;
        } else {
            return Math.pow(2, 9 - (zoom - 1));
        }
    }
}