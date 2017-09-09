ol.control.LayerMenu = function(opt_options) {

  var options = opt_options || {};

  this.state = {
    open: false
  };

  this.tiles = options.tiles;
  this.labels = options.labels;

  var btn = document.createElement('button');
  btn.innerHTML = '&#9776;';

  var this_ = this;

  // btn.addEventListener('click', this.renderLayerMenu, false);
  // btn.addEventListener('touchstart', this.renderLayerMenu, false);

  ol.events.listen(btn, ol.events.EventType.CLICK, this.toggleMenu, this);

  var element = document.createElement('div');
  element.className = 'layer-menu-toggle ol-unselectable ol-control';
  element.appendChild(btn);

  var container = document.createElement('div');
  container.className = 'layer-menu-container';
  container.appendChild(element);

  var menu = document.createElement('div');
  menu.className = 'layer-menu';
  container.appendChild(menu);

  ol.control.Control.call(this, {
    element: container,
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

ol.control.LayerMenu.prototype.openMenu = function(){

  var map = this.getMap();
  var layers = map.getLayers();

  // this.element.style.display = 'none';

  var toggle = this.element.querySelector('.layer-menu-toggle button');
  toggle.innerHTML = 'X';

  var menu = this.element.querySelector('.layer-menu');
  menu.style.display = 'block';

  if(menu.innerHTML == ''){
    this.renderMenuContents();
  };

}

ol.control.LayerMenu.prototype.closeMenu = function(){

  var map = this.getMap();
  var layers = map.getLayers();

  // this.element.style.display = 'none';

  var toggle = this.element.querySelector('.layer-menu-toggle button');
  toggle.innerHTML = '&#9776;';

  var menu = this.element.querySelector('.layer-menu');
  menu.style.display = 'none';

}

ol.control.LayerMenu.prototype.renderMenuContents = function(){
  // var map = this.getMap();
  // var layers = map.getLayers()

  var menu = this.element.querySelector('.layer-menu');

  var tilesContainer = document.createElement('div');
  tilesContainer.innerHTML = '<b>TILES:</b>';

  // render available Tile endpoints
  this.tiles.map(function(e,idx){
    var label = document.createElement('label')
    var element = document.createElement('input');
    element.setAttribute('type', 'radio');
    element.setAttribute('name', 'tiles');
    element.setAttribute('value', 'TEst');
    label.appendChild(element);
    var name = document.createElement('span');
    name.innerHTML = e;
    label.appendChild(name);
    tilesContainer.appendChild(label);
  })

  menu.appendChild(tilesContainer);

  var labelContainer = document.createElement('div');
  labelContainer.innerHTML = '<b>LABELS:</b>';

  // render available Tile endpoints
  this.labels.map(function(e,idx){
    var label = document.createElement('label')
    var element = document.createElement('input');
    element.setAttribute('type', 'radio');
    element.setAttribute('name', 'labels');
    element.setAttribute('value', 'TEst');
    label.appendChild(element);
    var name = document.createElement('span');
    name.innerHTML = e;
    label.appendChild(name);
    labelContainer.appendChild(label);
  })

  menu.appendChild(labelContainer);
}


ol.control.LayerMenu.prototype.dummyFunction = function(){

  var map = this.getMap();
  var view = map.getView();
  var layers = map.getLayers();

  
}
