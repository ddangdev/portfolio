/* The page shell: skip link, header, the bento, footer and the mouse view pill. */
import Bento from './features/bento/Bento';
import SiteFooter from './features/footer/SiteFooter';
import SiteHeader from './features/header/SiteHeader';
import ViewPillCursor from './components/ViewPillCursor';
import { ANCHORS } from './data/site';
import { usePageReady } from './motion/usePageReady';

export default function App() {
  usePageReady();
  return (
    <>
      <a className="skip" href={`#${ANCHORS.work}`}>skip to the work</a>
      <SiteHeader />
      <Bento />
      <SiteFooter />
      <ViewPillCursor />
    </>
  );
}
