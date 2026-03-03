import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useNetworkStore } from '../../../store/networkStore';

export function ZoomControls() {
  const { scale, setScale, resetView } = useNetworkStore();

  const handleZoomIn = () => {
    setScale(Math.min(scale * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale / 1.2, 0.1));
  };

  return (
    <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-2">
      <button
        onClick={handleZoomOut}
        className="p-2 hover:bg-secondary rounded text-foreground"
        title="缩小"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <div className="px-2 text-sm text-muted-foreground min-w-12 text-center">
        {Math.round(scale * 100)}%
      </div>

      <button
        onClick={handleZoomIn}
        className="p-2 hover:bg-secondary rounded text-foreground"
        title="放大"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-border" />

      <button
        onClick={resetView}
        className="p-2 hover:bg-secondary rounded text-foreground"
        title="重置视图"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}
