import {
  Language,
} from "./translations";


export const authTranslations = {
  en: {
    loginTitle: "Welcome back",
    loginSubtitle:
      "Sign in to access your network monitoring environment.",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in...",
    noAccount:
      "Don't have an account?",
    createAccount: "Create account",
    invalidCredentials:
      "Invalid email or password.",
    loginError:
      "Unable to sign in. Please try again.",

    registerTitle:
      "Create your account",
    registerSubtitle:
      "Your hosts, history, forecasts and alerts will remain linked to your account.",
    name: "Name",
    confirmPassword:
      "Confirm password",
    register: "Create account",
    registering:
      "Creating account...",
    haveAccount:
      "Already have an account?",
    backToLogin: "Sign in",
    passwordsDoNotMatch:
      "Passwords do not match.",
    passwordTooShort:
      "Password must contain at least 8 characters.",
    registerError:
      "Unable to create the account.",

    account: "Account",
    tabAccount: "Account",
    signedInAs: "Signed in as",
    secureSession:
      "Your session is protected with authentication.",
    logout: "Sign out",
    loggingOut: "Signing out...",
  },

  pt: {
    loginTitle: "Bem-vindo de volta",
    loginSubtitle:
      "Entre para acessar seu ambiente de monitoramento de rede.",
    email: "E-mail",
    password: "Senha",
    signIn: "Entrar",
    signingIn: "Entrando...",
    noAccount:
      "Ainda não possui uma conta?",
    createAccount: "Criar conta",
    invalidCredentials:
      "E-mail ou senha inválidos.",
    loginError:
      "Não foi possível entrar. Tente novamente.",

    registerTitle:
      "Crie sua conta",
    registerSubtitle:
      "Seus hosts, histórico, previsões e alertas ficarão vinculados à sua conta.",
    name: "Nome",
    confirmPassword:
      "Confirmar senha",
    register: "Criar conta",
    registering:
      "Criando conta...",
    haveAccount:
      "Já possui uma conta?",
    backToLogin: "Entrar",
    passwordsDoNotMatch:
      "As senhas não coincidem.",
    passwordTooShort:
      "A senha deve possuir pelo menos 8 caracteres.",
    registerError:
      "Não foi possível criar a conta.",

    account: "Conta",
    tabAccount: "Conta",
    signedInAs: "Conectado como",
    secureSession:
      "Sua sessão está protegida por autenticação.",
    logout: "Sair",
    loggingOut: "Saindo...",
  },

  es: {
    loginTitle: "Bienvenido de nuevo",
    loginSubtitle:
      "Inicia sesión para acceder a tu entorno de monitoreo de red.",
    email: "Correo electrónico",
    password: "Contraseña",
    signIn: "Iniciar sesión",
    signingIn:
      "Iniciando sesión...",
    noAccount:
      "¿Todavía no tienes una cuenta?",
    createAccount: "Crear cuenta",
    invalidCredentials:
      "Correo o contraseña inválidos.",
    loginError:
      "No fue posible iniciar sesión. Inténtalo de nuevo.",

    registerTitle:
      "Crea tu cuenta",
    registerSubtitle:
      "Tus hosts, historial, predicciones y alertas permanecerán vinculados a tu cuenta.",
    name: "Nombre",
    confirmPassword:
      "Confirmar contraseña",
    register: "Crear cuenta",
    registering:
      "Creando cuenta...",
    haveAccount:
      "¿Ya tienes una cuenta?",
    backToLogin: "Iniciar sesión",
    passwordsDoNotMatch:
      "Las contraseñas no coinciden.",
    passwordTooShort:
      "La contraseña debe tener al menos 8 caracteres.",
    registerError:
      "No fue posible crear la cuenta.",

    account: "Cuenta",
    tabAccount: "Cuenta",
    signedInAs:
      "Sesión iniciada como",
    secureSession:
      "Tu sesión está protegida por autenticación.",
    logout: "Cerrar sesión",
    loggingOut:
      "Cerrando sesión...",
  },
} as const;


export function getAuthTranslations(
  language: Language
) {
  return authTranslations[
    language
  ];
}