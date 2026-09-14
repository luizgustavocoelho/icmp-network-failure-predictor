import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getHosts,
} from "../services/api";

import {
  Host,
} from "../types/api";

import {
  useAuth,
} from "./AuthContext";


type HostContextType = {
  hosts: Host[];
  selectedHost: Host | null;
  isLoading: boolean;
  error: string | null;

  refreshHosts:
    () => Promise<Host[]>;

  selectHost:
    (hostId: number) => Promise<void>;
};


const HostContext =
  createContext<HostContextType | undefined>(
    undefined
  );


type HostProviderProps = {
  children: ReactNode;
};


export function HostProvider({
  children,
}: HostProviderProps) {
  const {
    user,
  } = useAuth();

  const userId =
    user?.id ?? null;

  const [
    hosts,
    setHosts,
  ] = useState<Host[]>([]);

  const [
    selectedHostId,
    setSelectedHostId,
  ] = useState<number | null>(
    null
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  const storageKey =
    userId !== null
      ? `@network-monitor/selected-host-id:${userId}`
      : null;


  const selectedHost =
    useMemo(
      () =>
        hosts.find(
          (host) =>
            host.id ===
            selectedHostId
        ) ?? null,
      [
        hosts,
        selectedHostId,
      ]
    );


  async function chooseDefaultHost(
    hostList: Host[],
    preferredHostId?: number | null
  ) {
    const preferredHost =
      preferredHostId !== null &&
      preferredHostId !== undefined
        ? hostList.find(
            (host) =>
              host.id ===
              preferredHostId
          )
        : undefined;

    const nextHost =
      preferredHost ??
      hostList.find(
        (host) =>
          host.is_active
      ) ??
      hostList[0] ??
      null;

    setSelectedHostId(
      nextHost?.id ?? null
    );

    return nextHost;
  }


  async function refreshHosts():
    Promise<Host[]> {
    if (!user) {
      setHosts([]);
      setSelectedHostId(null);
      setError(null);
      setIsLoading(false);

      return [];
    }

    try {
      setError(null);

      const data =
        await getHosts();

      setHosts(data);

      await chooseDefaultHost(
        data,
        selectedHostId
      );

      return data;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load hosts.";

      setError(message);

      throw caughtError;
    } finally {
      setIsLoading(false);
    }
  }


  async function selectHost(
    hostId: number
  ) {
    setSelectedHostId(
      hostId
    );

    if (storageKey) {
      await AsyncStorage.setItem(
        storageKey,
        String(hostId)
      );
    }
  }


  useEffect(() => {
    let cancelled = false;

    async function bootstrapHosts() {
      if (
        userId === null ||
        !storageKey
      ) {
        setHosts([]);
        setSelectedHostId(null);
        setError(null);
        setIsLoading(false);

        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [
          data,
          storedHostId,
        ] =
          await Promise.all([
            getHosts(),
            AsyncStorage.getItem(
              storageKey
            ),
          ]);

        if (cancelled) {
          return;
        }

        setHosts(data);

        const parsedHostId =
          storedHostId
            ? Number(
                storedHostId
              )
            : null;

        const validStoredHostId =
          parsedHostId !== null &&
          Number.isInteger(
            parsedHostId
          )
            ? parsedHostId
            : null;

        const selected =
          data.find(
            (host) =>
              host.id ===
              validStoredHostId
          ) ??
          data.find(
            (host) =>
              host.is_active
          ) ??
          data[0] ??
          null;

        setSelectedHostId(
          selected?.id ?? null
        );
      } catch (caughtError) {
        if (cancelled) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load hosts."
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void bootstrapHosts();

    return () => {
      cancelled = true;
    };
  }, [
    userId,
    storageKey,
  ]);


  useEffect(() => {
    async function persistSelection() {
      if (
        !storageKey ||
        selectedHostId === null
      ) {
        return;
      }

      await AsyncStorage.setItem(
        storageKey,
        String(
          selectedHostId
        )
      );
    }

    void persistSelection();
  }, [
    selectedHostId,
    storageKey,
  ]);


  return (
    <HostContext.Provider
      value={{
        hosts,
        selectedHost,
        isLoading,
        error,
        refreshHosts,
        selectHost,
      }}
    >
      {children}
    </HostContext.Provider>
  );
}


export function useHosts() {
  const context =
    useContext(
      HostContext
    );

  if (!context) {
    throw new Error(
      "useHosts must be used inside HostProvider."
    );
  }

  return context;
}
