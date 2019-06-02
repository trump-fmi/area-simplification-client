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
        class LabelDebug extends ol.control.Control {
            constructor(opt_options) {
                opt_options = opt_options || {};
                var container = document.createElement('div');
                var options = {
                    element: container,
                    target: opt_options.target
                };
                super(options);
                this.container = container;
                this.container.className = 'ol-label-debug ol-control ol-collapsed';
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
                // Checkbox for enabling the drawing of the circles
                var drawCirclesCheckboxContainer = rowContainerTemplate.cloneNode();
                var drawCirclesCheckbox = document.createElement('input');
                drawCirclesCheckbox.setAttribute('type', 'checkbox');
                drawCirclesCheckbox.id = 'drawCirclesCheckbox';
                var drawCircleLabel = document.createElement('label');
                drawCircleLabel.htmlFor = 'drawCirclesCheckbox';
                drawCircleLabel.appendChild(drawCirclesCheckbox);
                drawCircleLabel.appendChild(document.createTextNode('Draw circles around the labels.'));
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
                menuContent.appendChild(drawCirclesCheckboxContainer);
                menuContent.appendChild(labelfactorSliderContainer);
                menuContent.appendChild(minTFactorSliderContainer);
                menuContent.appendChild(minTCoeffRangeContainer);
                menuContent.appendChild(zoomSliderContainer);
                menuContent.appendChild(demoModeControlContainer);
                this.menu.appendChild(menuContent);
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
        control.LabelDebug = LabelDebug;
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
                var checked = eventTarget.checked;
                this.state.layers.getArray()
                    .filter(layer => layer instanceof ol.layer.Label)
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
            activateLayer(event) {
                var eventTarget = event.target;
                if (eventTarget.value === undefined) {
                    return;
                }
                var selectedOpt = eventTarget.value;
                var checked = eventTarget.checked;
                this.state.layers.getArray()
                    .filter(layer => !(layer instanceof ol.layer.Label))
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
                var tilesContainer = document.createElement('div');
                tilesContainer.innerHTML = '<h5>Tiles</h5>';
                var tileList = document.createElement('ul');
                this.state.layers = this.getMap().getLayers();
                this.state.layers.forEach(function (layer, index, array) {
                    if (layer instanceof ol.layer.Label || layer.get('title') == undefined) {
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
        class Label extends ol.layer.Vector {
            constructor(opt_options) {
                if (!opt_options.style) {
                    opt_options.style = ol.style.labelStyle;
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
        function labelStyle(feature, resolution) {
            //Create new label
            var label = new ol.Label(feature, resolution);
            return label.render();
        }
        style.labelStyle = labelStyle;
    })(style = ol.style || (ol.style = {}));
})(ol || (ol = {}));
