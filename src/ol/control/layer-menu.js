ol.control.LayerMenu = function(opt_options) {

  var options = opt_options || {};

  this.state = {
    open: false,
    layers: []
  };

  this.btn = document.createElement('button');
  this.btn.innerHTML = '&#9776;';

  //Create reference to current scope
  var _this = this;

  //Register event listener for button and use current scope
  this.btn.addEventListener('click', function () {
    _this.toggleMenu();
  });

  this.container = document.createElement('div');
  this.container.className = 'ol-layer-menu ol-control ol-collapsed';

  this.menu = document.createElement('div');
  this.menu.className = 'layer-menu';

  this.container.appendChild(this.menu);
  this.container.appendChild(this.btn);

  ol.control.Control.call(this, {
    element: this.container,
    target: options.target
  });
}

ol.inherits(ol.control.LayerMenu, ol.control.Control);

ol.control.LayerMenu.prototype.toggleMenu = function(){
  if(this.state.open === true){
    this.closeMenu();
  }else{
    this.openMenu();
  }

  this.state.open = !this.state.open;
}

ol.control.LayerMenu.prototype.activateLayerLabel = function(event){

  if(event.target.value == undefined){
    return
  }

  selectedOpt = event.target.value;
  checked = event.target.checked;

  this.state.layers.getArray()
    .filter(layer => layer instanceof ol.layer.Label)
    .forEach(
      layer => {
        const title = layer.get('title');
        if(title === selectedOpt){
          layer.setVisible(true);
        }else{
          layer.setVisible(false);
        }
      }
    )
}

ol.control.LayerMenu.prototype.activateLayer = function(event){

  if(event.target.value === undefined){
    return
  }

  selectedOpt = event.target.value;
  checked = event.target.checked;

  this.state.layers.getArray()
    .filter(layer => !(layer instanceof ol.layer.Label))
    .forEach(
      layer => {
        const title = layer.get('title');
        if(title === selectedOpt){
          layer.setVisible(true);
        }else{
          layer.setVisible(false);
        }
      }
    )
}

ol.control.LayerMenu.prototype.openMenu = function(){

  var map = this.getMap();
  var layers = map.getLayers();

  this.btn.innerHTML = 'X';

  this.container.classList.remove('ol-collapsed');


  if(this.menu.innerHTML == ''){
    this.renderMenuContents();
  };

}

ol.control.LayerMenu.prototype.closeMenu = function(){

  var map = this.getMap();
  var layers = map.getLayers();

  this.container.classList.add('ol-collapsed');

  this.btn.innerHTML = '&#9776;';

}

ol.control.LayerMenu.prototype.renderMenuContents = function(){

  var tilesContainer = document.createElement('div');
  tilesContainer.innerHTML = '<h5>Tiles</h5>';
  var tileList = document.createElement('ul');

  this.state.layers = map.getLayers();

  this.state.layers.forEach(function(layer, index, array) {

    if(layer instanceof ol.layer.Label || layer.get('title') == undefined){
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
  this.state.layers.forEach(function(layer,idx){

    if(!(layer instanceof ol.layer.Label) || layer.get('title') == undefined){
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
