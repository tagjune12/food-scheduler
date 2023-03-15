type options = {
  position: naver.maps.LatLng;
  map: naver.maps.Map;
};

class CustomOverlay extends naver.maps.OverlayView {
  _element: HTMLElement;
  _position: any;

  constructor(elementString: string, options: options) {
    // constructor(options: options) {
    super();
    this._position = null;
    this._element = document.createElement('div');
    this._element.innerHTML = elementString;

    this.setPosition(options.position as naver.maps.LatLng);
    this.setMap(options.map || null);
  }

  setPosition(position: naver.maps.LatLng) {
    this._position = position;
    this.draw();
  }

  getPosition() {
    return this._position;
  }

  onAdd() {
    const overlayLayer = this.getPanes().overlayLayer;
    console.log('panes', this.getPanes());
    overlayLayer.appendChild(this._element);
  }
  onRemove() {
    // const overlayLayer = this.getPanes().overlayLayer; // ?? 왜있는지 몰?루

    this._element.remove();
    // overlayLayer.remove();
    this._element.onclick = null;
  }

  draw() {
    if (!this.getMap()) {
      console.log('cannot find map');
      return;
    }

    const projection = this.getProjection();
    const position = this.getPosition();
    const pixelPosition = projection.fromCoordToOffset(position);

    this._element.style.position = `left:${pixelPosition.x};top:${pixelPosition.y}`;
  }
}

export default CustomOverlay;
