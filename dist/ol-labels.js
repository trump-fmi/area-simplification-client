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
                hideTilesLabel.appendChild(document.createTextNode('Hide all tiles'));
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
                labelfactorLabel.appendChild(document.createTextNode('Set the coefficient of the labelFactor. (1.1)'));
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
                minTLabel.appendChild(document.createTextNode('Set the offset for the calculation of the min_t. (9)'));
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
                minTCoeffLabel.appendChild(document.createTextNode('Set the coefficient for the calculation of the min_t. (1.0)'));
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
                zoomSliderLabel.appendChild(document.createTextNode('Use the slider to change the zoom level with the defined zoom delta:'));
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
                map.on("moveend", function (event) {
                    // Get zoom level and round to 3 decimal places
                    var newZoomLevel = map.getView().getZoom();
                    newZoomLevel = Math.round(newZoomLevel * 1000) / 1000;
                    document.getElementById('zoomLevelLabel').innerHTML = "zoom: " + newZoomLevel;
                    document.getElementById('zoomSliderInput').value = newZoomLevel.toString();
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
            toggleHideTiles_(event) {
                //Get checkbox element
                let checkBox = document.getElementById('hideTilesCheckbox');
                //Determine opacity depending on the checkbox state
                let opacity = checkBox.checked ? 0.0 : 1.0;
                //Adjust opacity of the tile layers accordingly
                this.getMap().getLayers().forEach(layer => {
                    if (layer instanceof ol.layer.Tile) {
                        layer.setOpacity(opacity);
                    }
                });
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
                document.getElementById('sliderLabel').innerHTML = 'Set the coefficient of the labelFactor. (' + range.value + ')';
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
                var container = document.createElement('div');
                var options = {
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
                var _this = this;
                //Register event listener for button and use current scope
                this.btn.addEventListener('click', function () {
                    _this.toggleMenu();
                });
                container.className = 'ol-layer-menu ol-control ol-collapsed';
                container.appendChild(this.menu);
                container.appendChild(this.btn);
                this.state = {
                    open: false,
                    layers: new ol.Collection()
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
            activateLayerLabel(event) {
                var eventTarget = event.target;
                if (eventTarget.value == undefined) {
                    return;
                }
                var selectedOpt = eventTarget.value;
                this.state.layers.getArray()
                    .filter(layer => layer instanceof ol.layer.Label)
                    .forEach(layer => {
                    layer.setVisible(layer.get('title') === selectedOpt);
                });
            }
            activateLayer(event) {
                var eventTarget = event.target;
                if (eventTarget.value === undefined) {
                    return;
                }
                var selectedOpt = eventTarget.value;
                var checked = eventTarget.checked;
                this.state.layers.getArray()
                    .filter(layer => (layer instanceof ol.layer.Tile))
                    .forEach(layer => {
                    const title = layer.get('title');
                    if (title === selectedOpt) {
                        layer.setVisible(true);
                    }
                    else {
                        layer.setVisible(false);
                    }
                });
            }
            openMenu() {
                var map = this.getMap();
                var layers = map.getLayers();
                this.btn.innerHTML = 'X';
                this.container.classList.remove('ol-collapsed');
                if (this.menu.innerHTML == '') {
                    this.renderMenuContents();
                }
            }
            closeMenu() {
                var map = this.getMap();
                var layers = map.getLayers();
                this.container.classList.add('ol-collapsed');
                this.btn.innerHTML = '&#9776;';
            }
            renderMenuContents() {
                /*
                Tiles
                 */
                var tilesContainer = document.createElement('div');
                tilesContainer.innerHTML = '<h5>Tiles</h5>';
                var tileList = document.createElement('ul');
                this.state.layers = this.getMap().getLayers();
                this.state.layers.forEach(function (layer) {
                    if (!(layer instanceof ol.layer.Tile) || (layer.get('title') == undefined)) {
                        return;
                    }
                    var title = layer.get('title');
                    var visible = layer.getVisible();
                    var li = document.createElement('li');
                    li.setAttribute('title', layer.get('description'));
                    var label = document.createElement('label');
                    var element = document.createElement('input');
                    element.setAttribute('type', 'radio');
                    element.setAttribute('name', 'tiles');
                    element.setAttribute('value', title);
                    element.checked = visible;
                    label.appendChild(element);
                    var name = document.createElement('span');
                    name.innerHTML = title;
                    label.appendChild(name);
                    li.appendChild(label);
                    tileList.appendChild(li);
                });
                tilesContainer.appendChild(tileList);
                this.menu.appendChild(tilesContainer);
                //Create reference to current scope
                var _this = this;
                //Register event listener for tiles container and use current scope
                tilesContainer.addEventListener('click', function (event) {
                    _this.activateLayer(event);
                });
                /*
                Areas
                 */
                //Create containers
                var areaContainer = document.createElement('div');
                areaContainer.innerHTML = '<h5>Areas</h5>';
                var areaList = document.createElement('ul');
                //Append list to container
                areaContainer.appendChild(areaList);
                //Add available areas to area list
                this.state.layers.forEach(function (layer, idx) {
                    //Filter for area layers
                    if (!(layer instanceof ol.layer.Area) || layer.get('title') == undefined) {
                        return;
                    }
                    //Cast layer
                    let areaLayer = layer;
                    //Create required DOM elements
                    var listItem = document.createElement('li');
                    var label = document.createElement('label');
                    var input = document.createElement('input');
                    var span = document.createElement('span');
                    //Input config
                    input.setAttribute('type', 'checkbox');
                    input.checked = areaLayer.wantDisplay;
                    //Span config
                    span.innerHTML = layer.get('title');
                    //Add click event listener to label
                    input.addEventListener('click', function (event) {
                        areaLayer.wantDisplay = !areaLayer.wantDisplay;
                    });
                    //Put elements together
                    label.appendChild(input);
                    label.appendChild(span);
                    listItem.appendChild(label);
                    areaList.appendChild(listItem);
                });
                //Add container to menu container
                this.menu.appendChild(areaContainer);
                /*
                Labels
                 */
                var labelContainer = document.createElement('div');
                labelContainer.innerHTML = '<h5>Labels</h5>';
                var labelList = document.createElement('ul');
                // render available Tile endpoints
                this.state.layers.forEach(function (layer, idx) {
                    if (!(layer instanceof ol.layer.Label) || layer.get('title') == undefined) {
                        return;
                    }
                    var title = layer.get('title');
                    var visible = layer.getVisible();
                    // console.log(title, visible);
                    var li = document.createElement('li');
                    var label = document.createElement('label');
                    var element = document.createElement('input');
                    element.setAttribute('type', 'radio');
                    element.setAttribute('name', 'labels');
                    element.setAttribute('value', title);
                    element.checked = visible;
                    label.appendChild(element);
                    var name = document.createElement('span');
                    name.innerHTML = title;
                    label.appendChild(name);
                    li.appendChild(label);
                    labelList.appendChild(li);
                });
                labelContainer.appendChild(labelList);
                this.menu.appendChild(labelContainer);
                //Register event listener for label container and use current scope
                labelContainer.addEventListener('click', function (event) {
                    _this.activateLayerLabel(event);
                });
            }
        }
        control.LayerMenu = LayerMenu;
    })(control = ol.control || (ol.control = {}));
})(ol || (ol = {}));

var ol;
(function (ol) {
    var layer;
    (function (layer) {
        /**
         * Instances of this class represent area layers that are used for displaying areas of a certain type on the map,
         * given as GeoJSON features. The layer will automatically be hidden if the current map zoom
         * is no longer within the zoom range of the area type it represents.
         */
        class Area extends ol.layer.Vector {
            /**
             * Creates a new layer for displaying areas on the map by passing an option object.
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
                //Set default options (if necessary) and call vector layer constructor
                super(options);
                this.areaType = areaType;
                this.map = map;
                this._wantDisplay = true;
                //Save reference to current scope
                let _this = this;
                //Register move end event handler on map in order to check for the zoom level
                this.map.on('moveend', function (event) {
                    _this.updateVisibility();
                });
            }
            /**
             * Checks the zoom level and wantDisplay property in order to determine whether the layer should
             * be visible or not and updates its visibility subsequently.
             */
            updateVisibility() {
                //Get current zoom level
                let zoomLevel = this.map.getView().getZoom();
                //Hide layer if not within desired zoom range or not supposed to be displayed, otherwise show it
                this.setVisible((zoomLevel >= this.areaType.zoom_min)
                    && (zoomLevel < this.areaType.zoom_max)
                    && this._wantDisplay);
            }
            /**
             * Returns whether the layer is supposed to be displayed in case the zoom level of the map
             * is within the zoom range of the area type.
             */
            get wantDisplay() {
                return this._wantDisplay;
            }
            /**
             * Sets whether the layer is supposed to be displayed in case the zoom level of the map
             * is within the zoom range of the area type. Subsequently, the visibility of the layer is updated.
             * @param value True, if the layer is supposed to be displayed; false otherwise
             */
            set wantDisplay(value) {
                this._wantDisplay = value;
                //Display/hide layer if necessary
                this.updateVisibility();
            }
        }
        layer.Area = Area;
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
                this.map = map;
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

/**
 * This file defines style constants that might be used as building blocks for area styles.
 */
var ol;
(function (ol) {
    var style;
    (function (style) {
        /**
         * Style for town borders.
         */
        style.STYLE_AREA_STATES = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#d1352a',
                width: 4
            })
        });
        /**
         * Style for town borders.
         */
        style.STYLE_AREA_TOWNS = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#a34905',
                width: 3
            })
        });
        /**
         * Style for commercial landuse.
         */
        style.STYLE_AREA_COMMERCIAL = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgb(238, 206, 209)'
            })
        });
        /**
         * Style for military landuse.
         */
        style.STYLE_AREA_MILITARY = new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#d11313'
            })
        });
        /**
         * Style for residential landuse.
         */
        style.STYLE_AREA_RESIDENTIAL = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgb(218, 218, 218)'
            })
        });
        /**
         * Style for woodland.
         */
        style.STYLE_AREA_WOODLAND = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#248c26',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: 'rgba(41, 163, 43, 0.6)'
            }),
            text: new ol.style.Text({
                font: 'bold 14px "Open Sans", "Arial Unicode MS", "sans-serif"',
                placement: 'point',
                stroke: new ol.style.Stroke({
                    color: 'black',
                    width: 2
                }),
                fill: new style.Fill({
                    color: 'white'
                }),
                rotateWithView: true
            })
        });
        style.STYLE_LINE_RIVERS = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#2c02c4',
                width: 2
            })
        });
        /**
         * Style for points that of an area polygon. May be helpful for debugging, should not be used
         * in productive environments however.
         */
        style.STYLE_AREA_POLYGON_POINTS = new ol.style.Style({
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
    (function (style) {
        //Maps resource names of area types onto arrays of area styles
        const AREA_STYLES_MAPPING = new TypedMap([
            ["states", [style.STYLE_AREA_STATES]],
            ["towns", [style.STYLE_AREA_TOWNS]],
            ["rivers", [style.STYLE_LINE_RIVERS]],
            ["commercial", [style.STYLE_AREA_COMMERCIAL]],
            ["residential", [style.STYLE_AREA_RESIDENTIAL]],
            ["military", [style.STYLE_AREA_MILITARY]],
            ["woodland", [style.STYLE_AREA_WOODLAND]]
        ]);
        /**
         * Returns a StyleFunction for a certain area type. This StyleFunction returns an array of styles
         * that may be used for rendering a given feature at a certain resolution.
         */
        function areaStyleFunction(areaType) {
            //Get styles array for this area type from the map
            let mappedStyles = AREA_STYLES_MAPPING.get(areaType.resource) || [];
            /**
             * Returns an array of styles for the given area type.
             *
             * @param feature The feature to return the styles for
             * @param resolution The resolution to use
             */
            return (feature, resolution) => {
                //Get label name for this feature
                let labelName = feature.get('name');
                //Sanitize it
                labelName = labelName || "";
                //Iterate over all mapped styles and update the text accordingly
                for (let i = 0; i < mappedStyles.length; i++) {
                    //Get text object of style
                    let textObject = mappedStyles[i].getText();
                    //Sanity check
                    if (!textObject) {
                        continue;
                    }
                    //Update text
                    textObject.setText(labelName);
                }
                return mappedStyles;
            };
        }
        style.areaStyleFunction = areaStyleFunction;
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
