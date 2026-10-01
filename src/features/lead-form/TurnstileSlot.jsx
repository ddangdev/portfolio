/* The box the Turnstile widget mounts into (useTurnstile renders into it). It reserves the widget's height
   so nothing shifts when the widget appears. React never renders children into it. */
export default function TurnstileSlot({ slotRef }) {
  return <div className="ts-slot" ref={slotRef}></div>;
}
