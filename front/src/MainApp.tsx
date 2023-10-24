// MainApp.tsx
import React from 'react';
import RouteSetup from 'routes/RoutesSetup';
import { useViewport } from 'hooks/useViewport';
import { usePageHeight } from 'hooks/usePageHeight';

const MainApp: React.FC = () => {
  const { width, height } = useViewport();
  const baseSizeWidth = 1728;
  const baseSizeHeight = usePageHeight();
  const maxwph = 1.3;

  let scale = 1;

  if (width > height * maxwph) {
    scale = width / baseSizeWidth;
  } else {
    scale = height * maxwph / baseSizeWidth;
  }

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${baseSizeWidth}px`,
        height: `${baseSizeHeight / scale}px`,
      }}
    >
      <RouteSetup />
    </div>
  );
}

export default MainApp;
