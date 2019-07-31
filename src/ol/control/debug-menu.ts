namespace ol.control {

    interface DebugMenuState {
        open: boolean;
        isDemoModeRunning: boolean;
    }

    interface MenuButtonIcon {
        openMenu: string;
        closeMenu: string;
    }

    export class DebugMenu extends ol.control.Control {

        private state: DebugMenuState;
        private container: HTMLDivElement;
        private menu: HTMLDivElement;
        private btn: HTMLButtonElement;
        private btnIcon: MenuButtonIcon;

        constructor(opt_options: olx.control.ControlOptions) {
            opt_options = opt_options || {};

            var container = document.createElement('div');

            var options: olx.control.ControlOptions = {
                element: container,
                target: opt_options.target
            };

            super(options);

            this.container = container;
            this.container.className = 'ol-debug-menu ol-control ol-collapsed';

            //Create menu element
            this.menu = document.createElement('div');
            this.menu.className = '';

            //Create button
            this.btn = document.createElement('button');
            this.btn.className = 'menu-toggle-button';
            this.btnIcon = {
                openMenu: '>_',
                closeMenu: 'X'
            };
            this.btn.innerHTML = this.btnIcon.openMenu;

            //Create reference to current scope
            var _this = this;
            //Register event listener for button and use current scope
            this.btn.addEventListener('click', function (event: Event) {
                _this.toggleMenu();
            });

            this.container.appendChild(this.btn);
            this.container.appendChild(this.menu);

            this.state = {
                open: false,
                isDemoModeRunning: false
            };
        }

        private toggleMenu() {
            if (this.state.open === true) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
            this.state.open = !this.state.open;
        }

        private openMenu() {
            this.btn.innerHTML = this.btnIcon.closeMenu;
            this.menu.style.display = '';

            if (this.menu.innerHTML.length == 0) {
                this.renderMenuContents();
            }
        }

        private closeMenu() {
            this.btn.innerHTML = this.btnIcon.openMenu;
            this.menu.style.display = "none";
        }

        private renderMenuContents() {
            const rangeCSSWidth = '300px';

            var map = this.getMap();

            var rowContainerTemplate = document.createElement('div');
            rowContainerTemplate.style.margin = '10px';

            //Checkbox for hiding tiles
            var hideTilesCheckboxContainer = rowContainerTemplate.cloneNode();

            var hideTilesCheckbox = document.createElement('input');
            hideTilesCheckbox.setAttribute('type', 'checkbox');
            hideTilesCheckbox.id = 'hideTilesCheckbox';

            var hideTilesLabel = document.createElement('label');
            hideTilesLabel.htmlFor = hideTilesCheckbox.id;
            hideTilesLabel.appendChild(hideTilesCheckbox);
            hideTilesLabel.appendChild(document.createTextNode('Hide tiles'));

            hideTilesCheckboxContainer.appendChild(hideTilesLabel);

            //Register event listener for tiles checkbox
            hideTilesCheckbox.addEventListener('change', function (event) {
                _this.toggleHideTiles_(event);
            });

            // Checkbox for enabling the drawing of the circles
            var drawCirclesCheckboxContainer = rowContainerTemplate.cloneNode();

            var drawCirclesCheckbox = document.createElement('input');
            drawCirclesCheckbox.setAttribute('type', 'checkbox');
            drawCirclesCheckbox.id = 'drawCirclesCheckbox';

            var drawCircleLabel = document.createElement('label');
            drawCircleLabel.htmlFor = 'drawCirclesCheckbox';
            drawCircleLabel.appendChild(drawCirclesCheckbox);
            drawCircleLabel.appendChild(document.createTextNode('Draw circles around the labels'));

            drawCirclesCheckboxContainer.appendChild(drawCircleLabel);

            //Register event listener for circle checkbox
            drawCirclesCheckbox.addEventListener('change', function (event) {
                _this.toggleDrawCircles_(event);
            });

            //@ts-ignore
            window.debugDrawCirc = false;

            // Slider for coefficient of labelfactor
            var labelfactorSliderContainer = rowContainerTemplate.cloneNode();

            var labelfactorRange = document.createElement('input');
            labelfactorRange.style.width = rangeCSSWidth;
            labelfactorRange.setAttribute('type', 'range');
            labelfactorRange.setAttribute('id', 'labelfactorRange');
            labelfactorRange.setAttribute('min', '0.0');
            labelfactorRange.setAttribute('max', '3.0');
            labelfactorRange.setAttribute('step', '0.1');
            labelfactorRange.defaultValue = '1.1';

            var labelfactorLabel = document.createElement('label');
            labelfactorLabel.id = 'sliderLabel';
            labelfactorLabel.htmlFor = 'labelfactorRange';
            labelfactorLabel.appendChild(document.createTextNode('Set the coefficient of the labelFactor. (1.1)'))

            labelfactorSliderContainer.appendChild(labelfactorLabel);
            labelfactorSliderContainer.appendChild(document.createElement('br'));
            labelfactorSliderContainer.appendChild(labelfactorRange);

            //Register event listener for label factor range slider
            labelfactorRange.addEventListener('input', function (event) {
                _this.changeLabelFactor_(event);
            });

            //@ts-ignore
            window.labelFacCoeff = 1.1;

            // Slider for controlling the calculation of the min_t value
            var minTFactorSliderContainer = rowContainerTemplate.cloneNode();

            var minTFactorRange = document.createElement('input');
            minTFactorRange.style.width = rangeCSSWidth;
            minTFactorRange.setAttribute('type', 'range');
            minTFactorRange.setAttribute('id', 'minTFactorRange');
            minTFactorRange.setAttribute('min', '0.0');
            minTFactorRange.setAttribute('max', '20');
            minTFactorRange.setAttribute('step', '0.1');
            minTFactorRange.defaultValue = '9';

            var minTLabel = document.createElement('label');
            minTLabel.id = 'minTLabel';
            minTLabel.htmlFor = 'minTFactorRange';
            minTLabel.appendChild(document.createTextNode('Set the offset for the calculation of the min_t. (9)'))

            //Register event listener for min_t factor range slider
            minTFactorRange.addEventListener('input', function (event) {
                _this.changeMinTFactor_(event);
            });

            minTFactorSliderContainer.appendChild(minTLabel);
            minTFactorSliderContainer.appendChild(document.createElement('br'));
            minTFactorSliderContainer.appendChild(minTFactorRange);

            //@ts-ignore
            window.minTFac = 9;

            var minTCoeffRangeContainer = rowContainerTemplate.cloneNode();
            var minTCoeffRange = document.createElement('input');
            minTCoeffRange.style.width = rangeCSSWidth;

            minTCoeffRange.setAttribute('type', 'range');
            minTCoeffRange.setAttribute('id', 'minTCoeffRange');
            minTCoeffRange.setAttribute('min', '0.0');
            minTCoeffRange.setAttribute('max', '5');
            minTCoeffRange.setAttribute('step', '0.1');
            minTCoeffRange.defaultValue = '1.0';

            var minTCoeffLabel = document.createElement('label');
            minTCoeffLabel.id = 'minTCoeffLabel';
            minTCoeffLabel.htmlFor = 'minTCoeffRange';
            minTCoeffLabel.appendChild(document.createTextNode('Set the coefficient for the calculation of the min_t. (1.0)'))

            //Create reference to current scope
            var _this = this;

            //Register event listener for min_t coefficient range slider
            minTCoeffRange.addEventListener('input', function (event) {
                _this.changeMinTCoeff_(event);
            });


            minTCoeffRangeContainer.appendChild(minTCoeffLabel);
            minTCoeffRangeContainer.appendChild(document.createElement('br'));
            minTCoeffRangeContainer.appendChild(minTCoeffRange);

            //@ts-ignore
            window.minTCoeff = 1.0;

            /* Create slider control for zoom level */
            var zoomSliderContainer = rowContainerTemplate.cloneNode();
            var zoomLevelDelta = document.createElement('input');
            zoomLevelDelta.style.marginLeft = '10px';
            zoomLevelDelta.style.width = '50px';

            zoomLevelDelta.setAttribute('type', 'number');
            zoomLevelDelta.setAttribute('id', 'zoomLevelDelta');
            zoomLevelDelta.setAttribute('min', '0.0');
            zoomLevelDelta.setAttribute('max', '10.0');
            zoomLevelDelta.setAttribute('step', '0.1');
            zoomLevelDelta.setAttribute('value', '1.0');

            var zoomSliderInput = document.createElement('input');
            zoomSliderInput.style.marginTop = '10px';
            zoomSliderInput.style.width = '600px';
            zoomSliderInput.setAttribute('type', 'range');
            zoomSliderInput.setAttribute('id', 'zoomSliderInput');
            zoomSliderInput.setAttribute('min', '0.0');
            zoomSliderInput.setAttribute('max', '28.0');
            zoomSliderInput.setAttribute('step', zoomLevelDelta.value);
            zoomSliderInput.defaultValue = map.getView().getZoom().toString();

            var zoomSliderLabel = document.createElement('label');
            zoomSliderLabel.id = 'zoomSliderLabel';
            zoomSliderLabel.htmlFor = 'zoomSliderInput';
            zoomSliderLabel.appendChild(document.createTextNode('Use the slider to change the zoom level with the defined zoom delta:'))

            var zoomLevelLabel = document.createElement('label');

            zoomLevelLabel.style.marginLeft = '10px';
            zoomLevelLabel.style.position = 'relative';
            zoomLevelLabel.style.top = '-6px';

            zoomLevelLabel.id = 'zoomLevelLabel';
            zoomLevelLabel.htmlFor = 'zoomLevelLabel';
            zoomLevelLabel.appendChild(document.createTextNode("zoom: " + map.getView().getZoom()));

            //Register event listener for zoom level delta input
            zoomLevelDelta.addEventListener('input', function () {
                zoomSliderInput.setAttribute('step', zoomLevelDelta.value);
            });

            //Register event listener for zoom slider
            zoomSliderInput.addEventListener('input', function () {
                var zoomValue = parseFloat(zoomSliderInput.value);

                document.getElementById('zoomLevelLabel').innerHTML = "zoom: " + zoomSliderInput.value;
                map.getView().setZoom(zoomValue);
            });

            // Add listener on view to detect changes on zoom level
            map.on("moveend", function (event: ol.events.Event) {
                // Get zoom level and round to 3 decimal places
                var newZoomLevel = map.getView().getZoom();
                newZoomLevel = Math.round(newZoomLevel * 1000) / 1000;
                document.getElementById('zoomLevelLabel').innerHTML = "zoom: " + newZoomLevel;
                (<HTMLInputElement>document.getElementById('zoomSliderInput')).value = newZoomLevel.toString();
            });

            // Add zoom slider
            zoomSliderContainer.appendChild(zoomSliderLabel);
            zoomSliderContainer.appendChild(zoomLevelDelta);
            zoomSliderContainer.appendChild(document.createElement('br'));
            zoomSliderContainer.appendChild(zoomSliderInput);
            zoomSliderContainer.appendChild(zoomLevelLabel);

            var demoModeControlContainer = rowContainerTemplate.cloneNode();
            var demoModeControlBtn = document.createElement('button');
            demoModeControlBtn.className = 'demo-mode-button';
            demoModeControlBtn.id = 'demoModeControlBtn';
            demoModeControlBtn.innerHTML = '&#9658';

            var demoModeControlLabel = document.createElement('label');
            demoModeControlLabel.id = 'demoModeControlLabel';
            demoModeControlLabel.htmlFor = 'demoModeControlBtn';
            demoModeControlLabel.innerHTML = 'Demo mode: ';

            //Store current scope
            var _this = this;

            //Register event listener for demo mode control button
            demoModeControlBtn.addEventListener('click', function () {
                if (_this.state.isDemoModeRunning) { // Demo is currently running
                    demoModeControlBtn.innerHTML = '&#9658;'; // Play icon
                    _this.stopDemoMode_();
                } else { // Demo mode is not running, start it
                    demoModeControlBtn.innerHTML = '&#10074;&#10074;'; // Stop icon
                    _this.startDemoMode_();
                }
                _this.state.isDemoModeRunning = !_this.state.isDemoModeRunning;
            });

            demoModeControlContainer.appendChild(demoModeControlLabel);
            demoModeControlContainer.appendChild(demoModeControlBtn);

            // Create container div for all debug menu entries
            var menuContent = document.createElement('div');
            menuContent.appendChild(hideTilesCheckboxContainer);
            menuContent.appendChild(drawCirclesCheckboxContainer);
            menuContent.appendChild(labelfactorSliderContainer);
            menuContent.appendChild(minTFactorSliderContainer);
            menuContent.appendChild(minTCoeffRangeContainer);
            menuContent.appendChild(zoomSliderContainer);
            menuContent.appendChild(demoModeControlContainer);

            this.menu.appendChild(menuContent);
        }

        /**
         * Toggles the display of tiles after the checkbox change event,
         * depending on the state of the corresponding checkbox. This changes the opacity of
         * the tile layers, so that there is no interference with the tile selection.
         *
         * @param event The checkbox change event
         */
        private toggleHideTiles_(event: Event): void {
            //Get checkbox element
            let checkBox = <HTMLInputElement>document.getElementById('hideTilesCheckbox');

            //Determine opacity depending on the checkbox state
            let opacity = checkBox.checked ? 0.0 : 1.0;

            //Adjust opacity of the tile layers accordingly
            this.getMap().getLayers().forEach(layer => {
                if (layer instanceof ol.layer.Tile) {
                    layer.setOpacity(opacity);
                }
            });
        }

        private toggleDrawCircles_(event: Event) {
            event.preventDefault();
            var checkBox = <HTMLInputElement>document.getElementById('drawCirclesCheckbox');
            // @ts-ignore
            window.debugDrawCirc = checkBox.checked;
            this.updateLabelLayer_();
        }

        private changeLabelFactor_(event: Event) {
            event.preventDefault();
            var range = <HTMLInputElement>document.getElementById('labelfactorRange');
            document.getElementById('sliderLabel').innerHTML = 'Set the coefficient of the labelFactor. (' + range.value + ')';
            // @ts-ignore
            window.labelFacCoeff = range.value;
            this.updateLabelLayer_();
        }

        private changeMinTFactor_(event: Event) {
            event.preventDefault();
            var range = <HTMLInputElement>document.getElementById('minTFactorRange');
            document.getElementById('minTLabel').innerHTML = 'Set the offset for the calculation of the min_t. (' + range.value + ')';
            // @ts-ignore
            window.minTFac = range.value;
            this.updateLabelLayer_();
        }

        private changeMinTCoeff_(event: Event) {
            event.preventDefault();
            var range = <HTMLInputElement>document.getElementById('minTCoeffRange');
            document.getElementById('minTCoeffLabel').innerHTML = 'Set the coefficient for the calculation of the min_t. (' + range.value + ')';
            // @ts-ignore
            window.minTCoeff = range.value;
            this.updateLabelLayer_();
        }

        private updateLabelLayer_() {
            // Refresh layers after updating the draw circle settings
            this.getMap().getLayers().forEach(function (layer) {
                if (layer instanceof ol.layer.Label) {
                    layer.getSource().refresh();
                }
            });
        }

        private startDemoMode_() {
            function getRandomRotation() {
                return (Math.random() * (Math.PI * 2));
            }

            // Get random zoom level between 4 - 10
            function getRandomZoom() {
                return Math.round(Math.random() * 6) + 4;
            }

            function getRandomLocationInGermany() {
                var rangeLong = [8.0, 12.0]; // More exactly = [6.0, 15.0]
                var rangeLat = [48.0, 54.0]; // More exactly = [47.5, 54.8]

                var randomLong = (Math.random() * (rangeLong[1] - rangeLong[0] + 1)) + rangeLong[0];
                var randomLat = (Math.random() * (rangeLat[1] - rangeLat[0] + 1)) + rangeLat[0];
                return ol.proj.fromLonLat([randomLong, randomLat]);
            }

            function callback() {
                window.setTimeout(function () {
                    if (_this.state.isDemoModeRunning) {
                        _this.startDemoMode_();
                    }
                }, 1);
            }

            var _this = this;
            var view = this.getMap().getView();
            var currentZoomLevel = 14;

            // Calculate the animation duration in dependence of the zoom lebel difference
            var newZoomLevel = getRandomZoom();
            var zoomLevelDifference = Math.abs(currentZoomLevel - newZoomLevel);
            var animationDuration = 3000 * zoomLevelDifference;

            var newLocation = getRandomLocationInGermany();
            var newRotation = getRandomRotation();

            view.animate({
                center: newLocation,
                duration: (animationDuration * 2),
                rotation: newRotation
            }, callback);

            view.animate({
                zoom: newZoomLevel,
                duration: animationDuration
            }, {
                zoom: currentZoomLevel,
                duration: animationDuration
            });
        }

        private stopDemoMode_() {
            var view = this.getMap().getView();

            //Stop demo mode animation
            view.cancelAnimations();
        }
    }
}
