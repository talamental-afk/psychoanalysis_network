import { SearchBar } from './SearchBar';
import { ZoomControls } from './ZoomControls';

export function Toolbar() {
  return (
    <div className="flex items-center gap-4 p-4 bg-background border-b border-border">
      <SearchBar />
      <ZoomControls />
    </div>
  );
}

export default Toolbar;
