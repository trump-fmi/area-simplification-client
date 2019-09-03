namespace ol.control {

    interface LayerMenuState {
        open: boolean;
        layers: ol.Collection<ol.layer.Base>;
    }

    export class LayerMenu extends ol.control.Control {

        private state: LayerMenuState;
        private container: HTMLDivElement;
        private menu: HTMLDivElement;
        private btn: HTMLButtonElement;

        constructor(opt_options: olx.control.ControlOptions) {
            opt_options = opt_options || {};

            var container = document.createElement('div');

            var options: olx.control.ControlOptions = {
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

        private toggleMenu() {
            if (this.state.open === true) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
            this.state.open = !this.state.open;
        }

        private activateLayerLabel(event: Event) {

            var eventTarget = <HTMLInputElement>event.target;

            if (eventTarget.value == undefined) {
                return;
            }

            var selectedOpt = eventTarget.value;

            this.state.layers.getArray()
                .filter(layer => layer instanceof ol.layer.Label)
                .forEach(layer => {
                        layer.setVisible(layer.get('title') === selectedOpt);
                    }
                );
        }

        private activateLayer(event: Event) {

            var eventTarget = <HTMLInputElement>event.target;

            if (eventTarget.value === undefined) {
                return
            }

            var selectedOpt = eventTarget.value;
            var checked = eventTarget.checked;

            this.state.layers.getArray()
                .filter(layer => (layer instanceof ol.layer.Tile))
                .forEach(
                    layer => {
                        const title = layer.get('title');
                        if (title === selectedOpt) {
                            layer.setVisible(true);
                        } else {
                            layer.setVisible(false);
                        }
                    }
                )
        }

        private openMenu() {
            var map = this.getMap();
            var layers = map.getLayers();

            this.btn.innerHTML = 'X';

            this.container.classList.remove('ol-collapsed');


            if (this.menu.innerHTML == '') {
                this.renderMenuContents();
            }
        }

        private closeMenu() {
            var map = this.getMap();
            var layers = map.getLayers();

            this.container.classList.add('ol-collapsed');

            this.btn.innerHTML = '&#9776;';
        }

        private renderMenuContents() {
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
                var listItem = document.createElement('li');
                var checkboxContainer = document.createElement('label');
                var checkbox = document.createElement('input');
                var nameSpan = document.createElement('span');

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
                var opacitySliderContainer = document.createElement('span');
                opacitySliderContainer.style.marginLeft = '5px';
                opacitySliderContainer.style.cssFloat = 'right';
                var opacitySlider = document.createElement('input');
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
                var clearElement = document.createElement('div');
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
            var labelContainer = document.createElement('div');
            labelContainer.innerHTML = '<h5>Labels</h5>';
            var labelList = document.createElement('ul');

            //Render available label endpoints
            this.state.layers.forEach(function (layer, idx) {

                if (!(layer instanceof ol.layer.Label) || layer.get('title') == undefined) {
                    return;
                }

                var title = layer.get('title');
                var visible = layer.getVisible();

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
}
