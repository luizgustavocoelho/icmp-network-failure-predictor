import {
  Language,
} from "./translations";


export const hostTranslations = {
  en: {
    selectedHost: "Selected host",
    changeHost: "Change host",
    noHosts: "No hosts configured",
    addFirstHost:
      "Add a host to start monitoring.",
    manageHosts: "Manage hosts",
    manageHostsDescription:
      "Add, edit and choose the network target used by the dashboard.",
    addHost: "Add host",
    editHost: "Edit host",
    hostName: "Name",
    ipAddress: "IP address",
    description: "Description",
    optional: "Optional",
    monitoring: "Monitoring",
    monitoringActive: "Active",
    monitoringPaused: "Paused",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    select: "Select",
    selected: "Selected",
    edit: "Edit",
    delete: "Delete",
    deleteTitle: "Delete host?",
    deleteMessage:
      "This will permanently delete this host and its related measurements, predictions and alerts.",
    deleteConfirm: "Delete",
    hostCreated: "Host created",
    hostUpdated: "Host updated",
    duplicateHost:
      "A host with this IP address already exists.",
    invalidForm:
      "Enter a name and a valid IP address.",
    hostActionError:
      "Unable to save the host.",
    hostDeleteError:
      "Unable to delete the host.",
    back: "Back",
  },

  pt: {
    selectedHost: "Host selecionado",
    changeHost: "Trocar host",
    noHosts: "Nenhum host configurado",
    addFirstHost:
      "Adicione um host para começar o monitoramento.",
    manageHosts: "Meus Hosts",
    manageHostsDescription:
      "Adicione, edite e escolha o alvo de rede usado pelo monitoramento.",
    addHost: "Adicionar host",
    editHost: "Editar host",
    hostName: "Nome",
    ipAddress: "Endereço IP",
    description: "Descrição",
    optional: "Opcional",
    monitoring: "Monitoramento",
    monitoringActive: "Ativo",
    monitoringPaused: "Pausado",
    save: "Salvar",
    saving: "Salvando...",
    cancel: "Cancelar",
    select: "Selecionar",
    selected: "Selecionado",
    edit: "Editar",
    delete: "Excluir",
    deleteTitle: "Excluir host?",
    deleteMessage:
      "Isso excluirá permanentemente o host e seus dados relacionados de medições, previsões e alertas.",
    deleteConfirm: "Excluir",
    hostCreated: "Host criado",
    hostUpdated: "Host atualizado",
    duplicateHost:
      "Já existe um host com este endereço IP.",
    invalidForm:
      "Informe um nome e um endereço IP válido.",
    hostActionError:
      "Não foi possível salvar o host.",
    hostDeleteError:
      "Não foi possível excluir o host.",
    back: "Voltar",
  },

  es: {
    selectedHost: "Host seleccionado",
    changeHost: "Cambiar host",
    noHosts: "No hay hosts configurados",
    addFirstHost:
      "Añade un host para comenzar el monitoreo.",
    manageHosts: "Mis Hosts",
    manageHostsDescription:
      "Añade, edita y elige el objetivo de red utilizado por el monitoreo.",
    addHost: "Añadir host",
    editHost: "Editar host",
    hostName: "Nombre",
    ipAddress: "Dirección IP",
    description: "Descripción",
    optional: "Opcional",
    monitoring: "Monitoreo",
    monitoringActive: "Activo",
    monitoringPaused: "Pausado",
    save: "Guardar",
    saving: "Guardando...",
    cancel: "Cancelar",
    select: "Seleccionar",
    selected: "Seleccionado",
    edit: "Editar",
    delete: "Eliminar",
    deleteTitle: "¿Eliminar host?",
    deleteMessage:
      "Esto eliminará permanentemente el host y sus mediciones, predicciones y alertas relacionados.",
    deleteConfirm: "Eliminar",
    hostCreated: "Host creado",
    hostUpdated: "Host actualizado",
    duplicateHost:
      "Ya existe un host con esta dirección IP.",
    invalidForm:
      "Introduce un nombre y una dirección IP válida.",
    hostActionError:
      "No fue posible guardar el host.",
    hostDeleteError:
      "No fue posible eliminar el host.",
    back: "Volver",
  },
} as const;


export function getHostTranslations(
  language: Language
) {
  return hostTranslations[
    language
  ];
}
