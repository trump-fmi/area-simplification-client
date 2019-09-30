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

            let map = this.getMap();
            let view = map.getView();

            var rowContainerTemplate = document.createElement('div');
            rowContainerTemplate.style.margin = '10px';

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
            labelfactorLabel.id = 'labelFactorLabel';
            labelfactorLabel.htmlFor = 'labelfactorRange';
            labelfactorLabel.appendChild(document.createTextNode('Set the coefficient of the labelFactor: (1.1)'))

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
            minTFactorRange.setAttribute('max', '100');
            minTFactorRange.setAttribute('step', '0.1');
            minTFactorRange.defaultValue = '22';

            var minTLabel = document.createElement('label');
            minTLabel.id = 'minTLabel';
            minTLabel.htmlFor = 'minTFactorRange';
            minTLabel.appendChild(document.createTextNode('Set the offset for the calculation of the min_t: (22)'));

            //Register event listener for min_t factor range slider
            minTFactorRange.addEventListener('input', function (event) {
                _this.changeMinTFactor_(event);
            });

            minTFactorSliderContainer.appendChild(minTLabel);
            minTFactorSliderContainer.appendChild(document.createElement('br'));
            minTFactorSliderContainer.appendChild(minTFactorRange);

            //@ts-ignore
            window.minTFac = 22;

            var minTCoeffRangeContainer = rowContainerTemplate.cloneNode();
            var minTCoeffRange = document.createElement('input');
            minTCoeffRange.style.width = rangeCSSWidth;

            minTCoeffRange.setAttribute('type', 'range');
            minTCoeffRange.setAttribute('id', 'minTCoeffRange');
            minTCoeffRange.setAttribute('min', '0.0');
            minTCoeffRange.setAttribute('max', '50');
            minTCoeffRange.setAttribute('step', '0.1');
            minTCoeffRange.defaultValue = '1.0';

            var minTCoeffLabel = document.createElement('label');
            minTCoeffLabel.id = 'minTCoeffLabel';
            minTCoeffLabel.htmlFor = 'minTCoeffRange';
            minTCoeffLabel.appendChild(document.createTextNode('Set the coefficient for the calculation of the min_t: (1.0)'));

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
            zoomSliderInput.setAttribute('min', view.getMinZoom().toString());
            zoomSliderInput.setAttribute('max', view.getMaxZoom().toString());
            zoomSliderInput.setAttribute('step', zoomLevelDelta.value);
            zoomSliderInput.defaultValue = map.getView().getZoom().toString();

            var zoomSliderLabel = document.createElement('label');
            zoomSliderLabel.id = 'zoomSliderLabel';
            zoomSliderLabel.htmlFor = 'zoomSliderInput';
            zoomSliderLabel.appendChild(document.createTextNode('Change the zoom level with defined zoom delta:'));

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


            var rotationRangeContainer = rowContainerTemplate.cloneNode();
            var rotationRange = document.createElement('input');
            rotationRange.style.width = '600px';

            rotationRange.setAttribute('type', 'range');
            rotationRange.setAttribute('id', 'rotationRange');
            rotationRange.setAttribute('min', '0');
            rotationRange.setAttribute('max', '359');
            rotationRange.setAttribute('step', '1');
            rotationRange.defaultValue = '0';

            var rotationLabel = document.createElement('label');
            rotationLabel.id = 'rotationLabel';
            rotationLabel.htmlFor = 'rotationRange';
            rotationLabel.innerHTML = 'Change rotation: (0&deg;)';

            //Create reference to current scope
            var _this = this;

            //Register event listener for min_t coefficient range slider
            rotationRange.addEventListener('input', function (event) {
                _this.changeRotation_(event);
            });


            rotationRangeContainer.appendChild(rotationLabel);
            rotationRangeContainer.appendChild(document.createElement('br'));
            rotationRangeContainer.appendChild(rotationRange);


            // Add listener on view to detect changes on zoom level or rotation
            map.on("moveend", function (event: ol.events.Event) {
                //Get map view
                let view = map.getView();

                // Get zoom level and round to 3 decimal places
                let newZoomLevel = Math.round(view.getZoom() * 1000) / 1000;

                //Update zoom label and slider
                document.getElementById('zoomLevelLabel').innerHTML = "zoom: " + newZoomLevel;
                (<HTMLInputElement>document.getElementById('zoomSliderInput')).value = newZoomLevel.toString();

                //Get rotation and round
                let rotationDegrees = Math.round(view.getRotation() / (Math.PI / 180));

                //Update rotation label and slider
                document.getElementById('rotationLabel').innerHTML = 'Change rotation: (' + rotationDegrees + '&deg;)';
                (<HTMLInputElement>document.getElementById('rotationRange')).value = rotationDegrees.toString();
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
            menuContent.appendChild(drawCirclesCheckboxContainer);
            menuContent.appendChild(labelfactorSliderContainer);
            menuContent.appendChild(minTFactorSliderContainer);
            menuContent.appendChild(minTCoeffRangeContainer);
            menuContent.appendChild(zoomSliderContainer);
            menuContent.appendChild(rotationRangeContainer);
            menuContent.appendChild(demoModeControlContainer);

            this.menu.appendChild(menuContent);
        }


        /**
         * Changes the map rotation after the rotation slider issued the change event.
         * @param event The event issued by the rotation slider
         */
        private changeRotation_(event: Event): void {
            //Get slider element, read and convert value
            let slider = <HTMLInputElement>document.getElementById('rotationRange');
            let rotationDegrees = parseInt(slider.value);
            let rotationRadians = rotationDegrees * (Math.PI / 180);

            //Update map
            this.getMap().getView().setRotation(rotationRadians);

            //Update label
            document.getElementById('rotationLabel').innerHTML = 'Change rotation: (' + rotationDegrees + '&deg;)';
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
            document.getElementById('labelFactorLabel').innerHTML = 'Set the coefficient of the labelFactor. (' + range.value + ')';
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
