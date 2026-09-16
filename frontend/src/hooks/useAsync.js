import { useCallback, useEffect, useState } from "react";

/**
 * Generic async-list loader: runs `fetcher` whenever `deps` change,
 * exposing { data, loading, error, retry }. Guards against setting
 * state after the effect has been superseded by a newer call.
 */
export function useAsync(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const run = useCallback(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, loading: false, error: err });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => run(), [run]);

  return { ...state, retry: run };
}
