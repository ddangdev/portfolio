/* ddanghnl-site: the page. The wheel is there from the first frame - the visitor turns it to get
   around - under a world clock running along the top. It comes in clean, in turns: the wheel, the
   nav, the preview, then the rest (owner's call, 2026-11-04; the opening line that once played first
   is gone for good). */

import Wheel from './features/wheel/Wheel.jsx';
import Ticker from './features/ticker/Ticker.jsx';
import Cursor from './features/cursor/Cursor.jsx';

export default function App() {
  return (
    <main className="page">
      <h1 className="sr-only">ddanghnl: i make websites, brands and things you like</h1>
      <Wheel shown />
      <Ticker shown />
      <Cursor />
    </main>
  );
}
