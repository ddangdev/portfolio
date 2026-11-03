/* ddanghnl-site: the page. The wheel is there from the first frame - the visitor turns it to get
   around - under a world clock running along the top. The opening line that used to play first is
   off (owner's call, 2026-11-01: just load the site); it is still in features/opening if wanted back. */

import Wheel from './features/wheel/Wheel.jsx';
import Ticker from './features/ticker/Ticker.jsx';

export default function App() {
  return (
    <main className="page">
      <h1 className="sr-only">ddanghnl: i make websites, brands and things you like</h1>
      <Wheel shown />
      <Ticker shown />
    </main>
  );
}
