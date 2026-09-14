import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";


const ACCESS_TOKEN_KEY =
  "network_monitor_access_token";


let cachedAccessToken:
  | string
  | null
  | undefined;


async function readStoredToken():
  Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(
      ACCESS_TOKEN_KEY
    );
  }

  return SecureStore.getItemAsync(
    ACCESS_TOKEN_KEY
  );
}


async function writeStoredToken(
  token: string
): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(
      ACCESS_TOKEN_KEY,
      token
    );

    return;
  }

  await SecureStore.setItemAsync(
    ACCESS_TOKEN_KEY,
    token
  );
}


async function deleteStoredToken():
  Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(
      ACCESS_TOKEN_KEY
    );

    return;
  }

  await SecureStore.deleteItemAsync(
    ACCESS_TOKEN_KEY
  );
}


export async function getAccessToken():
  Promise<string | null> {
  if (cachedAccessToken !== undefined) {
    return cachedAccessToken;
  }

  cachedAccessToken =
    await readStoredToken();

  return cachedAccessToken;
}


export async function setAccessToken(
  token: string
): Promise<void> {
  if (
    !token ||
    typeof token !== "string"
  ) {
    throw new Error(
      "Invalid access token received from API."
    );
  }

  cachedAccessToken =
    token;

  await writeStoredToken(
    token
  );
}


export async function clearAccessToken():
  Promise<void> {
  cachedAccessToken =
    null;

  await deleteStoredToken();
}