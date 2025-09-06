import { useEffect, useLayoutEffect } from 'react';

// This custom hook automatically uses useLayoutEffect on the client
// and falls back to useEffect during server-side rendering
const useIsomorphicEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default useIsomorphicEffect;
