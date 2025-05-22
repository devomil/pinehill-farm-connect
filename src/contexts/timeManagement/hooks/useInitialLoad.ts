
import { useState, useRef } from 'react';
import { User } from '@/types';

export function useInitialLoad(currentUser: User | null) {
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const initialLoadRef = useRef(false);
  
  return {
    initialLoadDone,
    setInitialLoadDone,
    initialLoadRef
  };
}
