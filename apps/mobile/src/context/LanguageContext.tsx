import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Language,
  TranslationKey,
  translations,
} from "../i18n/translations";


const LANGUAGE_STORAGE_KEY =
  "@network-monitor/language";


type LanguageContextType = {
  language: Language;

  setLanguage: (
    language: Language
  ) => Promise<void>;

  cycleLanguage: () => Promise<void>;

  t: (
    key: TranslationKey
  ) => string;
};


const LanguageContext =
  createContext<LanguageContextType | undefined>(
    undefined
  );


type LanguageProviderProps = {
  children: ReactNode;
};


export function LanguageProvider({
  children,
}: LanguageProviderProps) {
  const [language, setCurrentLanguage] =
    useState<Language>("en");


  useEffect(() => {
    async function loadLanguage() {
      try {
        const storedLanguage =
          await AsyncStorage.getItem(
            LANGUAGE_STORAGE_KEY
          );

        if (
          storedLanguage === "en" ||
          storedLanguage === "pt" ||
          storedLanguage === "es"
        ) {
          setCurrentLanguage(
            storedLanguage
          );
        }
      } catch (error) {
        console.warn(
          "Could not load language preference.",
          error
        );
      }
    }

    loadLanguage();
  }, []);


  async function setLanguage(
    newLanguage: Language
  ) {
    setCurrentLanguage(
      newLanguage
    );

    try {
      await AsyncStorage.setItem(
        LANGUAGE_STORAGE_KEY,
        newLanguage
      );
    } catch (error) {
      console.warn(
        "Could not save language preference.",
        error
      );
    }
  }


  async function cycleLanguage() {
    const languageSequence: Language[] = [
      "en",
      "pt",
      "es",
    ];

    const currentIndex =
      languageSequence.indexOf(
        language
      );

    const nextIndex =
      (
        currentIndex + 1
      ) % languageSequence.length;

    const nextLanguage =
      languageSequence[
        nextIndex
      ];

    await setLanguage(
      nextLanguage
    );
  }


  function t(
    key: TranslationKey
  ): string {
    return translations[
      language
    ][key];
  }


  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        cycleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}


export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider."
    );
  }

  return context;
}