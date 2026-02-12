import { useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Hook to listen for realtime changes in curriculum and games
 * @param {Function} onUpdate - Callback function to call when a change occurs
 */
export const useRealtimeCurriculum = (onUpdate) => {
  const channelRef = useRef(null);
  const onUpdateRef = useRef(onUpdate);
  const globalTimeout = useRef(null);

  // Keep callback ref updated without re-triggering useEffect
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const instanceId = Math.random().toString(36).substring(7);
    const channelName = `content_sync_${instanceId}`;

    const handleUpdate = (type, payload) => {
      // Use UNIFIED debounce for all content tables.
      // 500ms is enough to batch rapid updates without feeling laggy
      const delay = 500;

      if (globalTimeout.current) {
        clearTimeout(globalTimeout.current);
      }
      
      globalTimeout.current = setTimeout(() => {
        if (onUpdateRef.current) {
          onUpdateRef.current(type, payload);
        }
      }, delay);
    };

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'programs' },
        (payload) => handleUpdate('programs', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'topics' },
        (payload) => handleUpdate('topics', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_categories' },
        (payload) => handleUpdate('game_categories', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blocks_game' },
        (payload) => handleUpdate('blocks_game', payload)
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (globalTimeout.current) clearTimeout(globalTimeout.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current).catch(() => {});
      }
    };
  // Subscription only on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 
};
