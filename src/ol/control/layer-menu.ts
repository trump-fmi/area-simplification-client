namespace ol.control {

    export class LayerMenu extends ol.control.Control {

        private container: HTMLDivElement;
        private menu: HTMLDivElement;
        private btn: HTMLButtonElement;

        private menuOpened: boolean;
        private allLayers: Array<ol.layer.Base>;

        constructor(opt_options: olx.control.ControlOptions) {
            opt_options = opt_options || {};

            let container = document.createElement('div');

            let options: olx.control.ControlOptions = {
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

        private renderMenuContents() {
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
                    let areaLayer = <ol.layer.Area>layer;

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
                        let element = <HTMLInputElement>event.target;
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

        private toggleMenu() {
            this.menuOpened ? this.closeMenu() : this.openMenu();
            this.menuOpened = !this.menuOpened;
        }

        private activateLayerXOR(activeLayer: ol.layer.Layer) {
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
        private openMenu() {
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
        private closeMenu() {
            this.container.classList.add('ol-collapsed');
            this.btn.innerHTML = '&#9776;';
        }

        /**
         * Toggles the visibility of all layers of a certain type by changing their opacity to either 1.0 or 0.0.
         * This way, here will not be any interference with a possibly available layer selection.
         */
        private toggleLayersByType(layerType: any): void {
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
}
