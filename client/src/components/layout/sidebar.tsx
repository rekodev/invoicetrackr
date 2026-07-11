import AppBrand from '../app-brand';
import Navigation from './navigation';

export default function Sidebar() {
  return (
    <aside className="border-default-200 bg-background sticky top-0 hidden h-dvh w-72 shrink-0 self-start overflow-y-auto border-r p-4 md:flex md:flex-col">
      <div className="mb-8 px-2 py-1">
        <AppBrand />
      </div>
      <Navigation />
    </aside>
  );
}
