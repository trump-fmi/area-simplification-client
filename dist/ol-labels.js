//Alias for typescript map
const TypedMap = Map;
var ol;
(function (ol) {
    /**
     * Calculate the min_t value from the resolution.
     * @param {number} resolution - current resolution
     */
    function resolutionToMinT(resolution) {
        //Read required parameters
        //@ts-ignore
        var minTCoeff = window.minTCoeff || 1;
        //@ts-ignore
        var minTFac = window.minTFac || 9;
        var zoom = Math.log2(156543.03390625) - Math.log2(resolution);
        if (zoom <= 3) {
            return 10000;
        }
        else {
            return minTCoeff * Math.pow(2, minTFac - (zoom - 1));
        }
    }
    ol.resolutionToMinT = resolutionToMinT;
    function calculateLabelFactor(feature) {
        var labelFactor = feature.get("lbl_fac");
        //Read required parameter
        //@ts-ignore
        var labelFacCoeff = window.labelFacCoeff || 1.1;
        return parseInt(labelFactor) * labelFacCoeff;
    }
    ol.calculateLabelFactor = calculateLabelFactor;
})(ol || (ol = {}));

var ol;
(function (ol) {
    var control;
    (function (control) {
        /**
         * Set of controls included in maps by default. Unless configured otherwise,
         * this returns a collection containing an instance of each of the following
         * controls:
         * * {@link ol.control.Zoom}
         * * {@link ol.control.Rotate}
         * * {@link ol.control.Attribution}
         *
         * @param opt_options Defaults options.
         * @return Controls.
         * @api stable
         */
        function defaults(opt_options) {
            var controls = new ol.Collection();
            var zoomControl = opt_options.zoom !== undefined ? opt_options.zoom : true;
            if (zoomControl) {
                controls.push(new ol.control.Zoom(opt_options.zoomOptions));
            }
            var rotateControl = opt_options.rotate !== undefined ? opt_options.rotate : true;
            if (rotateControl) {
                controls.push(new ol.control.Rotate(opt_options.rotateOptions));
            }
            var attributionControl = opt_options.attribution !== undefined ?
                opt_options.attribution : true;
            if (attributionControl) {
                controls.push(new ol.control.Attribution(opt_options.attributionOptions));
            }
            return controls;
        }
    })(control = ol.control || (ol.control = {}));
})(ol || (ol = {}));

var ol;
(function (ol) {
    var control;
    (function (control) {
        class DebugMenu extends ol.control.Control {
            constructor(opt_options) {
                opt_options = opt_options || {};
                var container = document.createElement('div');
                var options = {
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
                this.btn.addEventListener('click', function (event) {
                    _this.toggleMenu();
                });
                this.container.appendChild(this.btn);
                this.container.appendChild(this.menu);
                this.state = {
                    open: false,
                    isDemoModeRunning: false
                };
            }
            toggleMenu() {
                if (this.state.open === true) {
                    this.closeMenu();
                }
                else {
                    this.openMenu();
                }
                this.state.open = !this.state.open;
            }
            openMenu() {
                this.btn.innerHTML = this.btnIcon.closeMenu;
                this.menu.style.display = '';
                if (this.menu.innerHTML.length == 0) {
                    this.renderMenuContents();
                }
            }
            closeMenu() {
                this.btn.innerHTML = this.btnIcon.openMenu;
                this.menu.style.display = "none";
            }
            renderMenuContents() {
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
                labelfactorLabel.appendChild(document.createTextNode('Set the coefficient of the labelFactor: (1.1)'));
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
                minTLabel.appendChild(document.createTextNode('Set the offset for the calculation of the min_t: (9)'));
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
                map.on("moveend", function (event) {
                    //Get map view
                    let view = map.getView();
                    // Get zoom level and round to 3 decimal places
                    let newZoomLevel = Math.round(view.getZoom() * 1000) / 1000;
                    //Update zoom label and slider
                    document.getElementById('zoomLevelLabel').innerHTML = "zoom: " + newZoomLevel;
                    document.getElementById('zoomSliderInput').value = newZoomLevel.toString();
                    //Get rotation and round
                    let rotationDegrees = Math.round(view.getRotation() / (Math.PI / 180));
                    //Update rotation label and slider
                    document.getElementById('rotationLabel').innerHTML = 'Change rotation: (' + rotationDegrees + '&deg;)';
                    document.getElementById('rotationRange').value = rotationDegrees.toString();
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
                    }
                    else { // Demo mode is not running, start it
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
            changeRotation_(event) {
                //Get slider element, read and convert value
                let slider = document.getElementById('rotationRange');
                let rotationDegrees = parseInt(slider.value);
                let rotationRadians = rotationDegrees * (Math.PI / 180);
                //Update map
                this.getMap().getView().setRotation(rotationRadians);
                //Update label
                document.getElementById('rotationLabel').innerHTML = 'Change rotation: (' + rotationDegrees + '&deg;)';
            }
            toggleDrawCircles_(event) {
                event.preventDefault();
                var checkBox = document.getElementById('drawCirclesCheckbox');
                // @ts-ignore
                window.debugDrawCirc = checkBox.checked;
                this.updateLabelLayer_();
            }
            changeLabelFactor_(event) {
                event.preventDefault();
                var range = document.getElementById('labelfactorRange');
                document.getElementById('labelFactorLabel').innerHTML = 'Set the coefficient of the labelFactor. (' + range.value + ')';
                // @ts-ignore
                window.labelFacCoeff = range.value;
                this.updateLabelLayer_();
            }
            changeMinTFactor_(event) {
                event.preventDefault();
                var range = document.getElementById('minTFactorRange');
                document.getElementById('minTLabel').innerHTML = 'Set the offset for the calculation of the min_t. (' + range.value + ')';
                // @ts-ignore
                window.minTFac = range.value;
                this.updateLabelLayer_();
            }
            changeMinTCoeff_(event) {
                event.preventDefault();
                var range = document.getElementById('minTCoeffRange');
                document.getElementById('minTCoeffLabel').innerHTML = 'Set the coefficient for the calculation of the min_t. (' + range.value + ')';
                // @ts-ignore
                window.minTCoeff = range.value;
                this.updateLabelLayer_();
            }
            updateLabelLayer_() {
                // Refresh layers after updating the draw circle settings
                this.getMap().getLayers().forEach(function (layer) {
                    if (layer instanceof ol.layer.Label) {
                        layer.getSource().refresh();
                    }
                });
            }
            startDemoMode_() {
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
            stopDemoMode_() {
                var view = this.getMap().getView();
                //Stop demo mode animation
                view.cancelAnimations();
            }
        }
        control.DebugMenu = DebugMenu;
    })(control = ol.control || (ol.control = {}));
})(ol || (ol = {}));

var ol;
(function (ol) {
    var control;
    (function (control) {
        class LayerMenu extends ol.control.Control {
            constructor(opt_options) {
                opt_options = opt_options || {};
                let container = document.createElement('div');
                let options = {
                    element: container,
                    target: opt_options.target
                };
                super(options);
                this.container = container;
                this.menu = document.createElement('div');
                this.menu.className = 'layer-menu';
                this.btn = document.createElement('button');
                this.btn.innerHTML = '&#9776;';
                //Create reference to current scope
                let _this = this;
                //Register event listener for button and use current scope
                this.btn.addEventListener('click', function () {
                    _this.toggleMenu();
                });
                container.className = 'ol-layer-menu ol-control ol-collapsed';
                container.appendChild(this.menu);
                container.appendChild(this.btn);
                this.menuOpened = false;
                this.allLayers = [];
            }
            renderMenuContents() {
                //Get all available layers as array
                this.allLayers = this.getMap().getLayers().getArray();
                /*
                Tiles
                 */
                let tilesContainer = document.createElement('div');
                tilesContainer.innerHTML = '<h5>Tiles</h5>';
                let tilesList = document.createElement('ul');
                //Checkbox for showing tile layers
                let showTilesListItem = document.createElement('li');
                let showTilesCheckbox = document.createElement('input');
                showTilesCheckbox.setAttribute('type', 'checkbox');
                showTilesCheckbox.checked = true;
                let showTilesSpan = document.createElement('span');
                showTilesSpan.innerHTML = 'Show tiles';
                let showTilesLabel = document.createElement('label');
                showTilesLabel.appendChild(showTilesCheckbox);
                showTilesLabel.appendChild(showTilesSpan);
                showTilesCheckbox.addEventListener('change', this.toggleLayersByType.bind(this, ol.layer.Tile));
                showTilesListItem.appendChild(showTilesLabel);
                tilesList.appendChild(showTilesListItem);
                //Iterate over all tile layers
                this.allLayers.filter(layer => layer instanceof ol.layer.Tile)
                    .forEach(layer => {
                    let title = layer.get('title');
                    let visible = layer.getVisible();
                    let li = document.createElement('li');
                    let label = document.createElement('label');
                    let element = document.createElement('input');
                    element.setAttribute('type', 'radio');
                    element.setAttribute('name', 'tiles');
                    element.setAttribute('value', title);
                    element.checked = visible;
                    label.appendChild(element);
                    let name = document.createElement('span');
                    name.innerHTML = title;
                    label.appendChild(name);
                    li.appendChild(label);
                    tilesList.appendChild(li);
                    //Register event listener
                    let listenerFunction = this.activateLayerXOR.bind(this, layer);
                    element.addEventListener('click', listenerFunction);
                });
                tilesContainer.appendChild(tilesList);
                this.menu.appendChild(tilesContainer);
                /*
                Areas
                 */
                //Create containers
                let areaContainer = document.createElement('div');
                areaContainer.innerHTML = '<h5>Areas</h5>';
                let areaList = document.createElement('ul');
                //Append list to container
                areaContainer.appendChild(areaList);
                //Add available areas to area list
                this.allLayers.filter(layer => layer instanceof ol.layer.Area)
                    .forEach(layer => {
                    //Cast layer to area layer
                    let areaLayer = layer;
                    //Skip if layer is child
                    if (areaLayer.get("parent")) {
                        return;
                    }
                    //Create list of layers that should be affected by operations to this layer
                    let affectedLayers = [areaLayer];
                    let childrenLayers = areaLayer.get("children") || [];
                    affectedLayers.push(...childrenLayers);
                    //Create required DOM elements for checkbox and label
                    let listItem = document.createElement('li');
                    let checkboxContainer = document.createElement('label');
                    let checkbox = document.createElement('input');
                    let nameSpan = document.createElement('span');
                    //Config for checkbox
                    checkbox.setAttribute('type', 'checkbox');
                    checkbox.checked = areaLayer.displayIntention;
                    //Display layer name
                    nameSpan.innerHTML = layer.get('title');
                    //Add click event listener to container
                    checkbox.addEventListener('click', function (event) {
                        //Invert the visibility intention
                        affectedLayers.forEach(layer => layer.invertDisplayIntention());
                    });
                    //Create slider for adjusting layer opacity
                    let opacitySliderContainer = document.createElement('span');
                    opacitySliderContainer.style.marginLeft = '5px';
                    opacitySliderContainer.style.cssFloat = 'right';
                    let opacitySlider = document.createElement('input');
                    opacitySlider.style.width = '60px';
                    opacitySlider.style.height = '18px';
                    opacitySlider.setAttribute('title', 'Opacity: 100%');
                    opacitySlider.setAttribute('type', 'range');
                    opacitySlider.setAttribute('min', '0.0');
                    opacitySlider.setAttribute('max', '1.0');
                    opacitySlider.setAttribute('step', '0.01');
                    opacitySlider.defaultValue = '1.0';
                    //Register input event listener for slider
                    opacitySlider.addEventListener('input', function (event) {
                        //Get slider element and its value
                        let element = event.target;
                        let value = parseFloat(element.value);
                        //Adjust layer opacity of all affected layxers accordingly
                        affectedLayers.forEach(layer => layer.setOpacity(value));
                        //Update title content
                        element.setAttribute('title', "Opacity: " + Math.round(value * 100) + "%");
                    });
                    //Append slider to its container
                    opacitySliderContainer.appendChild(opacitySlider);
                    //Create empty div for clearing floats
                    let clearElement = document.createElement('div');
                    clearElement.style.clear = 'both';
                    //Put elements together
                    checkboxContainer.appendChild(checkbox);
                    checkboxContainer.appendChild(nameSpan);
                    listItem.appendChild(checkboxContainer);
                    listItem.appendChild(opacitySliderContainer);
                    listItem.appendChild(clearElement);
                    areaList.appendChild(listItem);
                });
                //Add container to menu container
                this.menu.appendChild(areaContainer);
                /*
                Labels
                 */
                let labelContainer = document.createElement('div');
                labelContainer.innerHTML = '<h5>Labels</h5>';
                let labelsList = document.createElement('ul');
                //Checkbox for showing label layers
                let showLabelsListItem = document.createElement('li');
                let showLabelsCheckbox = document.createElement('input');
                showLabelsCheckbox.setAttribute('type', 'checkbox');
                showLabelsCheckbox.checked = true;
                let showLabelsSpan = document.createElement('span');
                showLabelsSpan.innerHTML = 'Show labels';
                let showLabelsLabel = document.createElement('label');
                showLabelsLabel.appendChild(showLabelsCheckbox);
                showLabelsLabel.appendChild(showLabelsSpan);
                showLabelsCheckbox.addEventListener('change', this.toggleLayersByType.bind(this, ol.layer.Label));
                showLabelsListItem.appendChild(showLabelsLabel);
                labelsList.appendChild(showLabelsListItem);
                //Render available label endpoints
                this.allLayers.filter(layer => layer instanceof ol.layer.Label)
                    .forEach(layer => {
                    let title = layer.get('title');
                    let visible = layer.getVisible();
                    let li = document.createElement('li');
                    let label = document.createElement('label');
                    let element = document.createElement('input');
                    element.setAttribute('type', 'radio');
                    element.setAttribute('name', 'labels');
                    element.setAttribute('value', title);
                    element.checked = visible;
                    label.appendChild(element);
                    let name = document.createElement('span');
                    name.innerHTML = title;
                    label.appendChild(name);
                    li.appendChild(label);
                    labelsList.appendChild(li);
                    //Register event listener
                    let listenerFunction = this.activateLayerXOR.bind(this, layer);
                    element.addEventListener('click', listenerFunction);
                });
                labelContainer.appendChild(labelsList);
                this.menu.appendChild(labelContainer);
            }
            toggleMenu() {
                this.menuOpened ? this.closeMenu() : this.openMenu();
                this.menuOpened = !this.menuOpened;
            }
            activateLayerXOR(activeLayer) {
                //Get class of the given layer
                let layerClass = activeLayer.constructor;
                //Iterate over all layers
                this.allLayers
                    .filter(layer => layer instanceof layerClass)
                    .forEach(layer => layer.setVisible(activeLayer == layer));
                console.log(this.allLayers);
            }
            /**
             * Opens the layer menu.
             */
            openMenu() {
                this.btn.innerHTML = 'X';
                this.container.classList.remove('ol-collapsed');
                //Check if content needs to be rendered
                if (this.menu.innerHTML == '') {
                    this.renderMenuContents();
                }
            }
            /**
             * Closes the layer menu.
             */
            closeMenu() {
                this.container.classList.add('ol-collapsed');
                this.btn.innerHTML = '&#9776;';
            }
            /**
             * Toggles the visibility of all layers of a certain type by changing their opacity to either 1.0 or 0.0.
             * This way, here will not be any interference with a possibly available layer selection.
             */
            toggleLayersByType(layerType) {
                //Iterate over all tile layers
                this.allLayers
                    //Filter for layers of the given type
                    .filter(layer => layer instanceof layerType)
                    .forEach(layer => {
                    //Invert opacity
                    let newOpacity = layer.getOpacity() < 1 ? 1 : 0;
                    layer.setOpacity(newOpacity);
                });
            }
        }
        control.LayerMenu = LayerMenu;
    })(control = ol.control || (ol.control = {}));
})(ol || (ol = {}));

var ol;
(function (ol) {
    var geom;
    (function (geom) {
        //Number of vertices to use for an arc line string
        const VERTICES_NUMBER = 32;
        /**
         * Represents line strings geometries that are aligned to an arc. Internally, a circle is created which is then
         * discretized to a line string with a certain number of vertices.
         */
        class ArcLineString extends ol.geom.LineString {
            constructor(circleCentre, radius, startAngle, endAngle, geometryLayout) {
                super([], geometryLayout);
                this._circleCentre = circleCentre;
                this._radius = radius;
                this._startAngle = startAngle;
                this._endAngle = endAngle;
                this.generateVertices();
            }
            generateVertices() {
                //Calculate vertices/radian ratio on a circle
                const VERTICES_PER_RADIAN = VERTICES_NUMBER / (2 * Math.PI);
                let circle = new ol.geom.Circle(this._circleCentre, this._radius).transform('EPSG:4326', 'EPSG:3857');
                let circlePolygon = ol.geom.Polygon.fromCircle(circle, VERTICES_NUMBER, 0);
                let polygonCoordinates = circlePolygon.getCoordinates()[0];
                let vertex_start_index = 0, vertex_end_index = 0;
                if (this._startAngle >= 0) {
                    vertex_start_index = Math.abs(this._startAngle) * VERTICES_PER_RADIAN;
                }
                else {
                    vertex_start_index = VERTICES_NUMBER - this._startAngle * VERTICES_PER_RADIAN;
                }
                if (this._endAngle >= 0) {
                    vertex_end_index = this._endAngle * VERTICES_PER_RADIAN;
                }
                else {
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
            get circleCentre() {
                return this._circleCentre;
            }
            set circleCentre(value) {
                this._circleCentre = value;
            }
            get radius() {
                return this._radius;
            }
            set radius(value) {
                this._radius = value;
            }
            get startAngle() {
                return this._startAngle;
            }
            set startAngle(value) {
                this._startAngle = value;
            }
            get endAngle() {
                return this._endAngle;
            }
            set endAngle(value) {
                this._endAngle = value;
            }
        }
        geom.ArcLineString = ArcLineString;
    })(geom = ol.geom || (ol.geom = {}));
})(ol || (ol = {}));

var ol;
(function (ol) {
    var layer;
    (function (layer) {
        /**
         * Instances of this class are vector layers that are aware of zoom levels and thus allow to automatically
         * show and hide the layer depending on the current zoom level.
         */
        class ZoomAware extends ol.layer.Vector {
            /**
             * Creates a new zoom-aware vector layer by passing layer options, a reference to the map instance to whose
             * zoom level the layer is supposed to be bound and optionally the minimum and maximum zoom levels.
             *
             * @param options An object of options to use within this layer
             * @param map The map instance to use
             * @param minZoom Minimum zoom level (inclusive) at which the layer may be visible
             * @param maxZoom Maximum zoom level (exclusive) at which the layer may be visible
             */
            constructor(options, map, minZoom, maxZoom) {
                //Call vector layer constructor and pass layer options
                super(options);
                this._minZoom = 0;
                this._maxZoom = Number.POSITIVE_INFINITY;
                this._displayIntention = true;
                this.map = map;
                //Update zoom range
                if (typeof minZoom !== "undefined") {
                    this._minZoom = minZoom;
                }
                if (typeof maxZoom !== "undefined") {
                    this._maxZoom = maxZoom;
                }
                let updateFunc = this.updateVisibility.bind(this);
                //Register move end event handler on map in order to check for the zoom level
                this.map.on('moveend', updateFunc);
            }
            /**
             * Inverts whether the layer is supposed to be displayed in case the zoom level of the map
             * is within the provided zoom range.
             */
            invertDisplayIntention() {
                this._displayIntention = !this._displayIntention;
                //Update visibility if necessary
                this.updateVisibility();
            }
            /**
             * Returns whether the layer is supposed to be visible for a given zoom level.
             * @param zoomLevel THe zoom level to check the visibility for
             */
            isVisibleAtZoomLevel(zoomLevel) {
                //Check display intention and zoom range
                return (zoomLevel >= this.minZoom)
                    && (zoomLevel < this.maxZoom)
                    && this._displayIntention;
            }
            /**
             * Overrides the corresponding method of the vector layer class. As a result, a call of this method will no
             * longer influence the visibility state of the layer directly. Instead, only the display intention
             * flag is set, while the actual visibility state still depends on the zoom levels.
             *
             * @param visible True, if the layer is supposed to be displayed within the given zoom range; false otherwise
             */
            setVisible(visible) {
                this.displayIntention = visible;
            }
            /**
             * Returns whether the layer is supposed to be displayed in case the zoom level of the map
             * is within the provided zoom range.
             *
             * @return True, if the layer is supposed to be displayed within the given zoom range; false otherwise
             */
            get displayIntention() {
                return this._displayIntention;
            }
            /**
             * Sets whether the layer is supposed to be displayed in case the zoom level of the map
             * is within the provided zoom range.
             *
             * @param display: True, if the layer is supposed to be displayed within the given zoom range; false otherwise
             */
            set displayIntention(display) {
                this._displayIntention = display;
                //Update visibility if necessary
                this.updateVisibility();
            }
            /**
             * Returns the minimum zoom level (inclusive) at which the layer may be visible.
             * @return The minimum zoom level
             */
            get minZoom() {
                return this._minZoom;
            }
            /**
             * Sets the minimum zoom level (inclusive) at which the layer may be visible.
             * @param value The minimum zoom level to set
             */
            set minZoom(value) {
                this._minZoom = value;
                //Update visibility if necessary
                this.updateVisibility();
            }
            /**
             * Returns the maximum zoom level (exclusive) at which the layer may be visible.
             * @return The maximum zoom level
             */
            get maxZoom() {
                return this._maxZoom;
            }
            /**
             * Sets the maximum zoom level (exclusive) at which the layer may be visible.
             * @param value The maximum zoom level to set
             */
            set maxZoom(value) {
                this._maxZoom = value;
            }
            /**
             * Checks the zoom level and displayIntention property in order to determine whether the layer should
             * be visible or not and updates its visibility subsequently.
             */
            updateVisibility() {
                //Get current zoom level
                let zoomLevel = this.map.getView().getZoom();
                let visible = this.isVisibleAtZoomLevel(zoomLevel);
                //Update visibility
                super.setVisible(visible);
            }
        }
        layer.ZoomAware = ZoomAware;
    })(layer = ol.layer || (ol.layer = {}));
})(ol || (ol = {}));

var ol;
(function (ol) {
    var layer;
    (function (layer) {
        //Z-index of label layer to use
        const LABEL_LAYER_Z_INDEX = 99999;
        /**
         * Instances of this class represent area layers that are used for displaying areas of a certain type on the map,
         * given as GeoJSON features. The layer will automatically be hidden if the current map zoom
         * is no longer within the zoom range of the area type it represents.
         */
        class Area extends layer.ZoomAware {
            /**
             * Creates a new layer for displaying areas on the map by passing a vector layer option object,
             * an area type and a map instance.
             *
             * @param options An object of options to use within this layer
             * @param areaType The area type that is represented by this layer
             * @param map The map instance for which the layer is used
             */
            constructor(options, areaType, map) {
                //If certain options were not set then provide a default value for them
                options.style = options.style || ol.style.areaStyleFunction(areaType);
                options.updateWhileAnimating = options.updateWhileAnimating || false;
                options.updateWhileInteracting = options.updateWhileInteracting || false;
                options.renderMode = options.renderMode || 'image'; //'vector' is default
                options.declutter = true;
                //Get zoom range from area type
                let minZoom = areaType.zoom_min;
                let maxZoom = areaType.zoom_max;
                //Set default options (if necessary) and call vector layer constructor
                super(options, map, minZoom, maxZoom);
                this.areaType = areaType;
                //Check if labels are desired for this area type
                if (this.areaType.labels) {
                    this._hasLabels = true;
                    //Create label layer and add it to the map
                    this.labelLayer = new ol.layer.AreaLabel({
                        source: new ol.source.Vector(),
                        zIndex: LABEL_LAYER_Z_INDEX
                    }, areaType.labels, map);
                    map.addLayer(this.labelLayer);
                }
                else {
                    this._hasLabels = false;
                }
                //No highlighting yet
                this.highlightLocation = null;
                //Save reference to current scope
                let _this = this;
                //Check if area source is used
                if (!(this.getSource() instanceof ol.source.Area)) {
                    return;
                }
                //Cast to area source
                let source = this.getSource();
                //Register a feature listener
                source.addFeatureListener(function (feature) {
                    _this.checkFeatureForHighlight(feature);
                    _this.createLabelForFeature(feature);
                });
            }
            /**
             * Returns whether labels are associated with this layer.
             * @return True, if labels are associated; false otherwise
             */
            get hasLabels() {
                return this._hasLabels;
            }
            /**
             * Highlights features of this layer at a certain location in case the layer allows highlighting.
             * @param location The location where the features are supposed to be highlighted
             */
            highlightFeaturesAt(location) {
                //Check if highlighting is allowed
                if (!this.areaType.search_highlight) {
                    return;
                }
                this.highlightLocation = location;
                //Save reference to current scope
                let _this = this;
                //Get source of layer
                let source = this.getSource();
                //Iterate over all features of the layer
                source.getFeatures().forEach(function (feature) {
                    _this.checkFeatureForHighlight(feature);
                });
            }
            createLabelForFeature(feature) {
                //Return if labels are not desired for this area type
                if (!this.hasLabels) {
                    return;
                }
                //Add arc label to label layer
                this.labelLayer.addLabelForFeature(feature);
            }
            /**
             * Checks if a certain feature is supposed to be highlighted or not and updates its highlight flag
             * accordingly.
             * @param feature The feature to check
             */
            checkFeatureForHighlight(feature) {
                //Sanity check
                if ((this.highlightLocation == null) || (feature == null)) {
                    return;
                }
                //Get geometry of feature
                let geometry = feature.getGeometry();
                //Check if highlight location is within the feature geometry
                if (geometry.intersectsCoordinate(this.highlightLocation)) {
                    //Flag for highlighting
                    feature.set('highlight', true);
                }
                else {
                    //Unflag for highlighting
                    feature.unset('highlight');
                }
            }
        }
        layer.Area = Area;
    })(layer = ol.layer || (ol.layer = {}));
})(ol || (ol = {}));

var ol;
(function (ol) {
    var layer;
    (function (layer) {
        /**
         * Instances of this class represent layer that are used for displaying labels of different kind
         * of a certain area type on the map. The layer will automatically be hidden if the current map zoom
         * is no longer within a defined range.
         */
        class AreaLabel extends layer.ZoomAware {
            /**
             * Creates a new layer for displaying arc labels on the map by passing a vector layer option object,
             * an label option object and a map instance.
             *
             * @param options An object of options to use within this layer
             * @param labelOptions The label-related options for this layer
             * @param map The map instance for which the layer is used
             */
            constructor(options, labelOptions, map) {
                //If certain options were not set then provide a default value for them
                options.style = options.style || ol.style.arcLabelStyleFunction;
                options.updateWhileAnimating = options.updateWhileAnimating || false;
                options.updateWhileInteracting = options.updateWhileInteracting || false;
                options.renderMode = options.renderMode || 'vector';
                options.declutter = true;
                options.source = options.source || new source.Vector();
                //Get zoom range from area type
                let minZoom = labelOptions.zoom_min;
                let maxZoom = labelOptions.zoom_max;
                //Set default options (if necessary) and call vector layer constructor
                super(options, map, minZoom, maxZoom);
                this.labelOptions = labelOptions;
            }
            addLabelForFeature(feature) {
                let labelText = feature.get("label") || "";
                labelText = labelText.trim();
                if (labelText.length < 2) {
                    return;
                }
                let circleCentre = feature.get("label_center");
                let innerRadius = feature.get("inner_radius");
                let outerRadius = feature.get("outer_radius");
                let startAngle = feature.get("start_angle");
                let endAngle = feature.get("end_angle");
                let arcLineString = new ol.geom.ArcLineString(circleCentre, innerRadius, startAngle, endAngle);
                let arcLabelFeature = new ol.Feature(arcLineString);
                arcLabelFeature.set("text", labelText);
                let featureId = feature.getId();
                arcLabelFeature.setId(featureId);
                this.getSource().addFeature(arcLabelFeature);
            }
        }
        layer.AreaLabel = AreaLabel;
    })(layer = ol.layer || (ol.layer = {}));
})(ol || (ol = {}));

var ol;
(function (ol) {
    var layer;
    (function (layer) {
        class Label extends ol.layer.Vector {
            constructor(opt_options) {
                if (!opt_options.style) {
                    opt_options.style = ol.style.labelStyleFunction;
                }
                // If no preferred options for update while animating or interacting are given, set them as default to true
                if (opt_options.updateWhileAnimating === undefined) {
                    opt_options.updateWhileAnimating = true;
                }
                if (opt_options.updateWhileInteracting === undefined) {
                    opt_options.updateWhileInteracting = true;
                }
                super(opt_options);
            }
        }
        layer.Label = Label;
    })(layer = ol.layer || (ol.layer = {}));
})(ol || (ol = {}));

var ol;
(function (ol) {
    var source;
    (function (source) {
        /**
         * Objects of this class represent sources that are able to load FeatureCollections describing
         * certain areas from an area server.
         */
        class Area extends source.Vector {
            /**
             * Creates a new area source by passing a options object and a map instance to which the source belongs.
             *
             * @param org_options The options object
             * @param map The map instance for which the source is used
             */
            constructor(org_options, map) {
                //Read url of the area server and create feature loader from it
                var areaServerUrl = org_options.url.toString();
                var featureLoader = Area.createFeatureLoader(areaServerUrl, map);
                //Overwrite required options
                org_options.format = new ol.format.GeoJSON();
                var oldZoom = 0;
                org_options.strategy = function (extent, resolution) {
                    var currentZoom = _this.map.getView().getZoom();
                    if (Math.abs(oldZoom - currentZoom) > 0.2) {
                        // @ts-ignore
                        _this.loadedExtentsRtree_.clear();
                        oldZoom = currentZoom;
                    }
                    return [extent];
                };
                org_options.url = featureLoader;
                super(org_options);
                var _this = this;
                //Set internal fields
                this.areaServerUrl = areaServerUrl;
                this.featureLoader = featureLoader;
                this.featureListeners = new Array();
                this.map = map;
            }
            /**
             * Registers a callback function at the source that is called in case a new feature is added.
             * @param callback Callback function that is supposed to be called
             */
            addFeatureListener(callback) {
                this.featureListeners.push(callback);
            }
            /**
             * Overrides the addFeature function of the parent class and extends its functionality.
             * This function considers whether the new features that are passed is an updated version of a feature that
             * is already part of the internal id index by comparing the numbers of coordinates that belong to each
             * feature's geometry. If this is the case, the old version is removed from to map so that OL will draw
             * the new version instead. This can be considered as a workaround in order to bypass
             * the naive id comparison of features.
             *
             * @param features An array of features that are supposed to be added to the map
             */
            addFeatures(features) {
                //Iterate over all passed features
                for (var i = 0; i < features.length; i++) {
                    //Get current feature and the corresponding old version that is already part of the layer
                    var newFeature = features[i];
                    var oldFeature = this.getFeatureById(newFeature.getId());
                    //Notify listeners
                    this.notifyFeatureListeners(newFeature);
                    //Check if old version of the feature exists
                    if (oldFeature == null) {
                        continue;
                    }
                    //Retrieve geometry of both features
                    var newPolygon = newFeature.getGeometry();
                    var oldPolygon = oldFeature.getGeometry();
                    //Get number of coordinates of each feature version
                    var newCoordNumber = newPolygon.getCoordinates()[0].length;
                    var oldCoordNumber = oldPolygon.getCoordinates()[0].length;
                    //Compare coordinate numbers
                    if (newCoordNumber != oldCoordNumber) {
                        //New feature is an updated version, thus remove old version from index
                        this.removeFeature(oldFeature);
                    }
                }
                //Finally proceed as usual
                return super.addFeatures(features);
            }
            /**
             * Creates and returns a feature loader object for this source by taking the URL of the desired area server
             * and a map instance. The feature loader may then be used for loading the features from the area server.
             *
             * @param areaServerUrl The URL of the label server to use
             * @param map The map instance for which the source is used
             */
            static createFeatureLoader(areaServerUrl, map) {
                //Define feature loader
                let featureLoader = (extent, resolution, projection) => {
                    //Split extend in order to get min and max coordinates
                    var min = ol.proj.toLonLat(extent.slice(0, 2));
                    var max = ol.proj.toLonLat(extent.slice(2, 4));
                    //Get current zoom from map
                    var zoom = map.getView().getZoom();
                    //Create parameters object for server request
                    var parameters = {
                        x_min: min[0],
                        x_max: max[0],
                        y_min: min[1],
                        y_max: max[1],
                        zoom: zoom
                    };
                    //Build query and return it
                    return Area.buildQuery(areaServerUrl, parameters);
                };
                return featureLoader;
            }
            /**
             * Builds a query string that may be used for retrieving areas at a certain map section from an area server.
             * The query consists out of the URL of the desired area server and a list of query string parameters
             * that are passed to this function as parameter object.
             *
             * @param areaServerUrl The URL of the area server to use
             * @param params An object whose fields represent the parameters to be used in the query
             */
            static buildQuery(areaServerUrl, params) {
                //Make sure params is an object
                if (typeof params !== 'object') {
                    params = {};
                }
                //Start building the query
                var parametersString = '?';
                var first = true;
                //Iterate over all fields of the parameters object
                for (var property in params) {
                    //Sanity check for each field
                    if (!params.hasOwnProperty(property)) {
                        continue;
                    }
                    //Read parameter
                    var param = property;
                    var value = params[property];
                    //Add separator depending on whether the current parameter is the first one
                    if (first) {
                        parametersString += param + '=' + value;
                    }
                    else {
                        parametersString += '&' + param + '=' + value;
                    }
                    first = false;
                }
                //Return full URL
                return areaServerUrl + parametersString;
            }
            /**
             * Notifies all feature listeners about the addition of a new feature.
             * @param feature The feature that is added
             */
            notifyFeatureListeners(feature) {
                this.featureListeners.forEach(function (callback) {
                    callback(feature);
                });
            }
        }
        source.Area = Area;
    })(source = ol.source || (ol.source = {}));
})(ol || (ol = {}));

var ol;
(function (ol) {
    var source;
    (function (source) {
        class Label extends source.Vector {
            constructor(org_options) {
                //Read url of the label server and create feature loader from it
                var labelServerUrl = org_options.url.toString();
                var featureLoader = Label.createFeatureLoader(labelServerUrl);
                //TODO: Allow user to set own options here?!
                //Overwrite required options
                org_options.format = new ol.format.GeoJSON();
                org_options.strategy = ol.loadingstrategy.bbox;
                org_options.url = featureLoader;
                super(org_options);
                this.labelServerUrl = labelServerUrl;
                this.featureLoader = featureLoader;
            }
            static createFeatureLoader(labelServerUrl) {
                let featureLoader = (extent, resolution, projection) => {
                    // extent: [minx, miny, maxx, maxy]
                    //ol.proj.toLonLat takes coord-pair, so need to split
                    var min = ol.proj.toLonLat(extent.slice(0, 2));
                    var max = ol.proj.toLonLat(extent.slice(2, 4));
                    // Calculate mint_t value for label request
                    var min_t = ol.resolutionToMinT(resolution);
                    var parameters = {
                        x_min: min[0],
                        x_max: max[0],
                        y_min: min[1],
                        y_max: max[1],
                        t_min: min_t
                    };
                    return Label.buildQuery(labelServerUrl, parameters);
                };
                return featureLoader;
            }
            static buildQuery(labelServerUrl, params) {
                if (typeof params !== 'object') {
                    params = {};
                }
                var query = '?';
                var first = true;
                for (var property in params) {
                    if (!params.hasOwnProperty(property)) {
                        continue;
                    }
                    var param = property;
                    var value = params[property];
                    if (first) {
                        query += param + '=' + value;
                    }
                    else {
                        query += '&' + param + '=' + value;
                    }
                    first = false;
                }
                return labelServerUrl + query;
            }
        }
        source.Label = Label;
    })(source = ol.source || (ol.source = {}));
})(ol || (ol = {}));

var ol;
(function (ol) {
    var style;
    (function (style) {
        //Basic style to use for arc labels
        const ARC_LABEL_STYLE = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'darkgreen',
                width: 5
            }),
            text: new ol.style.Text({
                font: 'bold 18px "Open Sans", "Arial Unicode MS", "sans-serif"',
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
        function arcLabelStyleFunction(feature, resolution) {
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
            return ARC_LABEL_STYLE;
        }
        style.arcLabelStyleFunction = arcLabelStyleFunction;
    })(style = ol.style || (ol.style = {}));
})(ol || (ol = {}));

/**
 * This file defines style constants that might be used as building blocks for area styles.
 */
var ol;
(function (ol) {
    var style;
    (function (style) {
        /**
         * Internal style template for towns.
         */
        const STYLE_TOWNS_TEMPLATE = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#a34905',
                width: 3
            })
        });
        /**
         * Internal style template for water areas.
         */
        const STYLE_WATER_AREA_TEMPLATE = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(44, 2, 196, 0.8)'
            })
        });
        /**
         * Internal style template for water lines.
         */
        const STYLE_WATER_LINE_TEMPLATE = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(44, 2, 196, 0.8)',
                width: 5
            }),
        });
        /**
         * StyleFunction for town borders.
         * @param feature The feature to style
         * @param resolution Current resolution (meters/pixel)
         */
        style.STYLE_TOWNS = function (feature, resolution) {
            return STYLE_TOWNS_TEMPLATE;
        };
        /**
         * Style for woodland.
         */
        style.STYLE_WOODLAND = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#248c26',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: 'rgba(41, 163, 43, 0.6)'
            })
        });
        /**
         * Style for farmland.
         */
        style.STYLE_FARMLAND = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#b5b540',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: 'rgba(204, 204, 110, 0.6)'
            })
        });
        /**
         * StyleFunction for water (lakes, rivers, ...).
         * @param feature The feature to style
         * @param resolution Current resolution (meters/pixel)
         */
        style.STYLE_WATER = function (feature, resolution) {
            //Width of rivers in meters
            const DEFAULT_RIVER_WIDTH = 18;
            let geomType = feature.getGeometry().getType();
            //Decide whether to use the line or the area template
            if ((geomType === "LineString") || (geomType === "MultiLineString")) {
                //Use the line template and determine river width
                let riverWidth = feature.get("width") || DEFAULT_RIVER_WIDTH;
                //Update line template accordingly
                const pixelWidth = riverWidth / resolution;
                STYLE_WATER_LINE_TEMPLATE.getStroke().setWidth(pixelWidth);
                return STYLE_WATER_LINE_TEMPLATE;
            }
            //Use the area template
            return STYLE_WATER_AREA_TEMPLATE;
        };
        /**
         * Style for commercial landuse.
         */
        style.STYLE_COMMERCIAL = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgb(238, 206, 209)'
            })
        });
        /**
         * Style for military landuse.
         */
        style.STYLE_MILITARY = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(209, 10, 19, 0.6)'
            })
        });
        /**
         * Style for residential landuse.
         */
        style.STYLE_RESIDENTIAL = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgb(218, 218, 218)'
            })
        });
        /**
         * Style for buildings.
         */
        style.STYLE_BUILDINGS = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#69523f',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: 'rgba(163, 130, 102, 1)'
            })
        });
        /**
         * Style for motorways.
         */
        style.STYLE_MOTORWAYS = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#E990A0',
                width: 7
            })
        });
        /**
         * Style for main streets.
         */
        style.STYLE_MAIN_STREETS = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#F6FABB',
                width: 5
            })
        });
        /**
         * Style for bystreets.
         */
        style.STYLE_BYSTREETS = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#FFFFFF',
                width: 4
            })
        });
        /**
         * Style for railways.
         */
        style.STYLE_RAILWAYS = [new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: [0, 0, 0, 1.0],
                    width: 4
                })
            }),
            // Dash white lines (second style, on the top)
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: [255, 255, 255, 1.0],
                    width: 4,
                    lineDash: [10, 20, 10, 20]
                })
            })
        ];
        /**
         * Style for highlighting certain areas.
         */
        style.STYLE_OTHER_HIGHLIGHT = new ol.style.Style({
            /*
            fill: new ol.style.Fill({
                color: 'rgba(235, 155, 52, 0.6)'
            })*/
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 5
            }),
            zIndex: 999999
        });
        /**
         * Style for points that of an area polygon. May be helpful for debugging, should not be used
         * in productive environments however.
         */
        style.STYLE_OTHER_POLYGON_POINTS = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: 'orange'
                })
            }),
            geometry: function (feature) {
                //Get geometry of feature
                var geometry = feature.getGeometry();
                //Check whether geometry is polygon or multi polygon
                if (geometry instanceof ol.geom.Polygon) {
                    //Return all points of the polygon so that points can be drawn
                    var polygon = geometry;
                    return new ol.geom.MultiPoint(polygon.getCoordinates()[0]);
                }
                else if (geometry instanceof ol.geom.MultiPolygon) {
                    var multiPolygon = geometry;
                    var coordinates = multiPolygon.getCoordinates();
                    //List for all found coordinates of the multi polygon
                    var coordinatesList = [];
                    //Iterate over all available coordinates
                    for (var i = 0; i < coordinates.length; i++) {
                        for (var k = 0; k < coordinates[i][0].length; k++) {
                            //Add current coordinate to list
                            coordinatesList.push(coordinates[i][0][k]);
                        }
                    }
                    //Return all coordinates of the multi polygon so that points can be drawn
                    return new ol.geom.MultiPoint(coordinatesList);
                }
            }
        });
    })(style = ol.style || (ol.style = {}));
})(ol || (ol = {}));

var ol;
(function (ol) {
    var style;
    (function (style_1) {
        //Mapping from area type sources to single styles, style lists or StyleFunctions
        const AREA_STYLES_MAPPING = new TypedMap([
            ["districts", style_1.STYLE_TOWNS],
            ["towns", style_1.STYLE_TOWNS],
            ["villages", style_1.STYLE_TOWNS],
            ["woodland", style_1.STYLE_WOODLAND],
            ["farmland", style_1.STYLE_FARMLAND],
            ["water", style_1.STYLE_WATER],
            ["commercial", style_1.STYLE_COMMERCIAL],
            ["military", style_1.STYLE_MILITARY],
            ["residential", style_1.STYLE_RESIDENTIAL],
            ["buildings", style_1.STYLE_BUILDINGS],
            ["motorways", style_1.STYLE_MOTORWAYS],
            ["main_streets", style_1.STYLE_MAIN_STREETS],
            ["bystreets", style_1.STYLE_BYSTREETS],
            ["railways", style_1.STYLE_RAILWAYS]
        ]);
        /**
         * Returns a StyleFunction for a certain area type which returns an array of styles
         * that may be used for rendering a given feature at a certain resolution.
         */
        function areaStyleFunction(areaType) {
            //Get style object from map for this area type
            const MAPPED_STYLE_OBJECT = AREA_STYLES_MAPPING.get(areaType.resource) || [];
            /**
             * Returns an array of styles for the given area type.
             *
             * @param feature The feature to return the styles for
             * @param resolution The resolution to use
             */
            return (feature, resolution) => {
                //Holds the list of styles that is finally returned
                let finalStyles = [];
                //Check if mapped style object is a single style, an array of styles or a StyleFunction
                if (MAPPED_STYLE_OBJECT instanceof ol.style.Style) {
                    //Single style
                    finalStyles.push(MAPPED_STYLE_OBJECT);
                }
                else if (MAPPED_STYLE_OBJECT instanceof Array) {
                    //Array of styles
                    MAPPED_STYLE_OBJECT.forEach(style => finalStyles.push(style));
                }
                else if (typeof MAPPED_STYLE_OBJECT === 'function') {
                    //StyleFunction, so call it
                    let generatedStyles = MAPPED_STYLE_OBJECT(feature, resolution);
                    //Check if StyleFunction returned a single style or a style array
                    if (generatedStyles instanceof ol.style.Style) {
                        //Single style, push to list
                        finalStyles.push(generatedStyles);
                    }
                    else if (generatedStyles instanceof Array) {
                        //Array, push all elements to list
                        generatedStyles.forEach(style => finalStyles.push(style));
                    }
                }
                //Add additional highlight style if highlighting is enabled for this feature
                if (feature.get('highlight')) {
                    return finalStyles.concat([style_1.STYLE_OTHER_HIGHLIGHT]);
                }
                return finalStyles;
            };
        }
        style_1.areaStyleFunction = areaStyleFunction;
    })(style = ol.style || (ol.style = {}));
})(ol || (ol = {}));

var ol;
(function (ol) {
    let LabelType;
    (function (LabelType) {
        LabelType[LabelType["ICON"] = 0] = "ICON";
        LabelType[LabelType["TEXT"] = 1] = "TEXT";
    })(LabelType || (LabelType = {}));
    const ICON_MAPPING = new TypedMap([
        ['aboriginal', 'buddhist.svg'],
        ['administration', 'town_hall.svg'],
        ['airport', 'aerodrome.12.svg'],
        ['artgallery', 'artwork.svg'],
        ['assortment', 'buddhist.svg'],
        ['atm', 'atm.svg'],
        ['bank', 'bank.svg'],
        ['bar', 'bar.svg'],
        ['bbq', 'picnic.svg'],
        ['beergarden', 'biergarten.svg'],
        ['bicycle_shop', 'shop/bicycle.svg'],
        ['boat', 'buddhist.svg'],
        ['breastfeeding', 'buddhist.svg'],
        ['bus', 'bus_stop.12.svg'],
        ['cafeteria', 'shop/coffee.svg'],
        ['car', 'shop/car.svg'],
        ['car_share', 'rental_car.svg'],
        ['casino', 'buddhist.svg'],
        ['catholicgrave', 'grave_yard_christian.svg'],
        ['church', 'christian.svg'],
        ['cinema', 'cinema.svg'],
        ['clock', 'buddhist.svg'],
        ['coffee', 'shop/coffee.svg'],
        ['communitycentre', 'community_centre.svg'],
        ['congress', 'town_hall.svg'],
        ['court', 'courthouse.svg'],
        ['dance_class', 'buddhist.svg'],
        ['dancinghall', 'buddhist.svg'],
        ['daycare', 'buddhist.svg'],
        ['dentist', 'dentist.svg'],
        ['drinkingfountain', 'fountain.svg'],
        ['e-bike-charging', 'charging_station.svg'],
        ['fast_food', 'fast_food.svg'],
        ['ferry', 'ferry.svg'],
        ['fillingstation', 'fuel.svg'],
        ['firemen', 'firestation.svg'],
        ['firstaid', 'buddhist.svg'],
        ['fountain', 'fountain.svg'],
        ['hospital', 'hospital.svg'],
        ['ice_cream', 'shop/ice_cream.svg'],
        ['library', 'library.svg'],
        ['market', 'shop/supermarket.svg'],
        ['medicalstore', 'pharmacy.svg'],
        ['medicine', 'pharmacy.svg'],
        ['music_classical', 'shop/musical_instrument.svg'],
        ['nursing_home_icon', 'buddhist.svg'],
        ['parking', 'parking.svg'],
        ['parking_bicycle', 'bicycle_parking.svg'],
        ['perfumery', 'shop/perfumery.svg'],
        ['police', 'police.svg'],
        ['postal', 'post_office.svg'],
        ['restaurant', 'restaurant.svg'],
        ['sauna', 'buddhist.svg'],
        ['school', 'buddhist.svg'],
        ['spa', 'buddhist.svg'],
        ['stripclub', 'buddhist.svg'],
        ['taxi', 'taxi.svg'],
        ['telephone', 'telephone.svg'],
        ['theatre', 'theatre.svg'],
        ['toilets', 'toilets.svg'],
        ['tools', 'buddhist.svg'],
        ['trash', 'waste_basket.10.svg'],
        ['undefined', 'buddhist.svg'],
        ['university', 'buddhist.svg'],
        ['veterinary', 'veterinary.svg'],
        ['waiting', 'bench.svg'],
        ['wifi', 'buddhist.svg'],
        ['workoffice', 'buddhist.svg']
    ]);
    const ICON_URL = "https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/";
    class Label {
        constructor(feature, resolution) {
            this.feature = feature;
            // Get needed fields from feature object
            this.text = feature.get("name");
            this.t = feature.get("t");
            this.factor = feature.get("lbl_fac");
            //resolve if icon or text label
            this.resolveType();
            //get global min t
            this.min_t = ol.resolutionToMinT(resolution);
        }
        resolveType() {
            if (this.text.includes('icon:')) {
                this.type = LabelType.ICON;
                var icon = this.text.replace('icon:', '');
                this.iconUrl = Label.getIconURL(icon);
            }
            else {
                this.type = LabelType.TEXT;
            }
        }
        render() {
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
                }
                else {
                    style = Label.iconCache.get(cache_key);
                }
            }
            else if (this.type == LabelType.TEXT) {
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
                }
                else {
                    style = Label.textCache.get(cache_key);
                }
            }
            return style;
        }
        static getIconURL(iconName) {
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
        static getMaxLabelLength(labelText) {
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
    Label.iconCache = new TypedMap();
    Label.textCache = new TypedMap();
    ol.Label = Label;
})(ol || (ol = {}));

var ol;
(function (ol) {
    var style;
    (function (style) {
        function labelStyleFunction(feature, resolution) {
            //Create new label
            var label = new ol.Label(feature, resolution);
            return label.render();
        }
        style.labelStyleFunction = labelStyleFunction;
    })(style = ol.style || (ol.style = {}));
})(ol || (ol = {}));
