import React from 'react';

interface CustomMarkerProps {
  map: naver.maps.Map;
  position: naver.maps.LatLng;
  title?: string;
  content?: string;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({
  map,
  position,
  title,
  content,
}) => {
  React.useEffect(() => {
    const markerContent = `
      <div class="custom-marker" style="
        width: 40px;
        height: 40px;
        background: #FF3B30;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transform: translate(-50%, -50%);
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
        </svg>
      </div>
      ${
        title
          ? `
        <div style="
          position: absolute;
          top: 45px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        ">${title}</div>
      `
          : ''
      }
    `;

    const marker = new naver.maps.Marker({
      position,
      map,
      icon: {
        content: markerContent,
        size: new naver.maps.Size(40, 40),
        anchor: new naver.maps.Point(20, 20),
      },
    });

    return () => {
      marker.setMap(null);
    };
  }, [map, position, title, content]);

  return null;
};

export default CustomMarker;
