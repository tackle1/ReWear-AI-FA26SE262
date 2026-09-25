import React from 'react';

export interface CameraGuideOverlayProps {
  stepGuide?: string;
  onCapture?: () => void;
}

export const CameraGuideOverlay: React.FC<CameraGuideOverlayProps> = ({
  stepGuide = 'Align clothing item within frame guides for AI verification',
  onCapture,
}) => {
  return (
    <div className="camera-guide-overlay">
      <div className="camera-guide-frame" />
      <p className="camera-guide-instructions">{stepGuide}</p>
      {onCapture && (
        <button className="camera-guide-capture-btn" onClick={onCapture}>
          Capture Photo
        </button>
      )}
    </div>
  );
};

export default CameraGuideOverlay;
