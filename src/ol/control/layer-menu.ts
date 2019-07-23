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

                //Cast layer
                let areaLayer = <ol.layer.Area>layer;

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
}
