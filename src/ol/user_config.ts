namespace ol {

    /**
     * Singleton class holding a set of write- and readable configuration parameters with default values
     * that may be changed by the user during runtime.
     */
    export class UserConfig {
        //The singleton UserConfig instance
        private static instance: UserConfig;

        //All config fields with default values
        private _featureUpdateLog: boolean = false;
        private _drawLabelCircles: boolean = false;
        private _drawLabelBoundaries: boolean = false;
        private _labelFactorCoeff: number = 1.1;
        private _minTFactor: number = 22;
        private _minTCoeff: number = 1.0;

        /**
         * Creates a new configuration with default values.
         */
        private constructor() {
        }

        /**
         * Returns the current configuration.
         * @return The configuration
         */
        public static get(): UserConfig {
            if (this.instance == null) {
                this.instance = new UserConfig();
            }
            return this.instance;
        }

        get featureUpdateLog(): boolean {
            return this._featureUpdateLog;
        }

        set featureUpdateLog(value: boolean) {
            this._featureUpdateLog = value;
        }

        get drawLabelCircles(): boolean {
            return this._drawLabelCircles;
        }

        set drawLabelCircles(value: boolean) {
            this._drawLabelCircles = value;
        }

        get drawLabelBoundaries(): boolean {
            return this._drawLabelBoundaries;
        }

        set drawLabelBoundaries(value: boolean) {
            this._drawLabelBoundaries = value;
        }

        get labelFactorCoeff(): number {
            return this._labelFactorCoeff;
        }

        set labelFactorCoeff(value: number) {
            this._labelFactorCoeff = value;
        }

        get minTFactor(): number {
            return this._minTFactor;
        }

        set minTFactor(value: number) {
            this._minTFactor = value;
        }

        get minTCoeff(): number {
            return this._minTCoeff;
        }

        set minTCoeff(value: number) {
            this._minTCoeff = value;
        }
    }
}

//Expose user config instance globally
const USER_CONFIG = ol.UserConfig.get();