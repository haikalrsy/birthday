/**
 * NotesScene.jsx
 *
 * Section "Catatan Observasi" — Poetic Scrapbook with 3D Pink Hardcover.
 * In closed state: Looks like the user's reference image (dusty rose pink hardcover,
 *   center geometric debossed plate, gold guidelines, 3D paper block & ribbon bookmark).
 * In open state: A stunning archival scrapbook & poetic intellectual journal
 *   with mounted polaroids, washi tape, and literary prose.
 */

import { useRef } from 'react';
import PoeticScrapbook from './PoeticScrapbook';
import { useReveal } from '../story/kit';

export default function NotesScene({ onGoToAllFavorites }) {
  const sectionRef = useRef(null);
  useReveal(sectionRef);

  return (
    <div ref={sectionRef} className="w-full">
      <PoeticScrapbook onExploreFavorites={onGoToAllFavorites} />
    </div>
  );
}