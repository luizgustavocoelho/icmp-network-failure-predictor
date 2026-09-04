import {
  ActivitySuitability,
  ActivityType,
} from "../types/api";

import {
  Language,
} from "./translations";


type RecommendationMessages = Record<
  ActivityType,
  Record<
    ActivitySuitability,
    string
  >
>;


const recommendationMessages: Record<
  Language,
  RecommendationMessages
> = {
  en: {
    videoconference: {
      recommended:
        "The predicted connection should be suitable for video conferences.",

      caution:
        "Video conferences may experience instability, delays or reduced quality.",

      not_recommended:
        "Video conferences are not recommended under the predicted network condition.",
    },

    streaming: {
      recommended:
        "The predicted connection should support video and audio streaming.",

      caution:
        "Streaming may experience buffering or automatic quality reduction.",

      not_recommended:
        "Streaming is not recommended under the predicted network condition.",
    },

    online_gaming: {
      recommended:
        "The predicted connection should be suitable for online gaming.",

      caution:
        "Online games may experience increased latency or temporary instability.",

      not_recommended:
        "Online gaming is not recommended under the predicted network condition.",
    },

    web_browsing: {
      recommended:
        "The predicted connection should be suitable for normal web browsing.",

      caution:
        "Web browsing should remain possible, but some pages may load more slowly.",

      not_recommended:
        "Web browsing may be severely affected by the predicted network condition.",
    },

    file_upload: {
      recommended:
        "The predicted connection should be suitable for uploading files.",

      caution:
        "File uploads may take longer or require retries.",

      not_recommended:
        "File uploads are not recommended under the predicted network condition.",
    },
  },


  pt: {
    videoconference: {
      recommended:
        "A conexão prevista deve ser adequada para videoconferências.",

      caution:
        "Videoconferências podem apresentar instabilidade, atrasos ou redução de qualidade.",

      not_recommended:
        "Videoconferências não são recomendadas para a condição de rede prevista.",
    },

    streaming: {
      recommended:
        "A conexão prevista deve ser adequada para streaming de vídeo e áudio.",

      caution:
        "O streaming pode apresentar travamentos ou redução automática da qualidade.",

      not_recommended:
        "Streaming não é recomendado para a condição de rede prevista.",
    },

    online_gaming: {
      recommended:
        "A conexão prevista deve ser adequada para jogos online.",

      caution:
        "Jogos online podem apresentar aumento de latência ou instabilidade temporária.",

      not_recommended:
        "Jogos online não são recomendados para a condição de rede prevista.",
    },

    web_browsing: {
      recommended:
        "A conexão prevista deve ser adequada para navegação normal na internet.",

      caution:
        "A navegação deve continuar possível, mas algumas páginas podem carregar mais lentamente.",

      not_recommended:
        "A navegação na internet pode ser fortemente afetada pela condição de rede prevista.",
    },

    file_upload: {
      recommended:
        "A conexão prevista deve ser adequada para envio de arquivos.",

      caution:
        "O envio de arquivos pode demorar mais ou precisar ser repetido.",

      not_recommended:
        "O envio de arquivos não é recomendado para a condição de rede prevista.",
    },
  },


  es: {
    videoconference: {
      recommended:
        "La conexión prevista debería ser adecuada para videoconferencias.",

      caution:
        "Las videoconferencias pueden presentar inestabilidad, retrasos o reducción de calidad.",

      not_recommended:
        "Las videoconferencias no se recomiendan para el estado de red previsto.",
    },

    streaming: {
      recommended:
        "La conexión prevista debería ser adecuada para streaming de video y audio.",

      caution:
        "El streaming puede presentar interrupciones o reducción automática de calidad.",

      not_recommended:
        "El streaming no se recomienda para el estado de red previsto.",
    },

    online_gaming: {
      recommended:
        "La conexión prevista debería ser adecuada para juegos en línea.",

      caution:
        "Los juegos en línea pueden presentar mayor latencia o inestabilidad temporal.",

      not_recommended:
        "Los juegos en línea no se recomiendan para el estado de red previsto.",
    },

    web_browsing: {
      recommended:
        "La conexión prevista debería ser adecuada para la navegación web normal.",

      caution:
        "La navegación debería seguir siendo posible, pero algunas páginas pueden cargar más lentamente.",

      not_recommended:
        "La navegación web puede verse gravemente afectada por el estado de red previsto.",
    },

    file_upload: {
      recommended:
        "La conexión prevista debería ser adecuada para cargar archivos.",

      caution:
        "La carga de archivos puede tardar más tiempo o requerir nuevos intentos.",

      not_recommended:
        "La carga de archivos no se recomienda para el estado de red previsto.",
    },
  },
};


export function getRecommendationMessage(
  language: Language,
  activity: ActivityType,
  suitability: ActivitySuitability
): string {
  return recommendationMessages[
    language
  ][activity][suitability];
}