import ReactDOM from 'react-dom/client';
import arrive from "arrive";
import { HeaderSubmenu } from '../App/components/header';
arrive

export async function initializeLoginButtons() {

  const rootSelector = ".hedInner";
  document.arrive(rootSelector, {onceOnly: true, existing: true}, function() {
    const root = ReactDOM.createRoot(this);
    root.render(<HeaderSubmenu />);
  });
}