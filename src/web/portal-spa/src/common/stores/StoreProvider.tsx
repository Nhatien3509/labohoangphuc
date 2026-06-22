import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
} from "react";
import { type StoreApi } from "zustand";
import equal from "fast-deep-equal/es6";
import { useStoreWithEqualityFn } from "zustand/traditional";

export const createStoreContext = <TState,>(
  createStoreFn: (initialState: TState) => StoreApi<TState>,
) => {
  const StoreContext = createContext<StoreApi<TState> | undefined>(undefined);

  type StoreProviderProps = {
    children: ReactNode;
    [key: string]: unknown;
  };

  const StoreProvider = ({ children, ...props }: StoreProviderProps) => {
    const storeRef = useRef<StoreApi<TState>>();
    const propsRef = useRef(props);
    const initialState = { ...props } as TState;

    storeRef.current ??= createStoreFn(initialState);
    useEffect(() => {
      if (!equal(propsRef.current, props) && storeRef.current) {
        propsRef.current = props;
        storeRef.current.setState({ ...props } as TState);
      }
    }, [props]);

    return (
      <StoreContext.Provider value={storeRef.current}>
        {children}
      </StoreContext.Provider>
    );
  };

  const useStoreContext = <TSelected,>(
    selector: (store: TState) => TSelected,
    equalityFn?: (a: TSelected, b: TSelected) => boolean,
  ): TSelected => {
    const storeContext = useContext(StoreContext);

    if (!storeContext) {
      throw new Error("useStoreContext must be used within a StoreProvider");
    }
    // truyền equalityFn xuống zustand
    return useStoreWithEqualityFn(storeContext, selector, equalityFn);
  };

  return {
    StoreProvider,
    useStoreContext,
  };
};
