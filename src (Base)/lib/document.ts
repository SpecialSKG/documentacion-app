// types/document.ts
export type SelectWithOther = {
  value: string;        // e.g. "DGT TECNOLOGIA" | "__OTHER__"
  otherText?: string;   // si value === "__OTHER__"
};

export type DetailRow = {
  id: string;

  // catálogo (padre/hijo/nieto)
  category?: SelectWithOther;
  subcategory?: SelectWithOther;
  item?: SelectWithOther;

  // campos de tu fila dinámica
  fieldName?: string;
  fieldType?: SelectWithOther;     // "Linea única", etc
  isRequired?: boolean;

  sla?: SelectWithOther;           // "10 días", etc
  infoType?: SelectWithOther;      // "Publica", "Confidencial"
  scope?: SelectWithOther;         // "Tecnología", etc
  mailbox?: string;

  groupName?: string;
  groupMembers?: string[];         // ["nombre.apellido", ...]
  notes?: string;

  // extensible
  extra?: Record<string, unknown>;
};

export type DocumentModel = {
  schemaVersion: 1;

  meta: {
    id: string;
    status: "editing" | "exported";
    createdAt: string;
    updatedAt: string;
    title?: string; // “Catálogo | Plantilla” o como lo definan
  };

  primary: {
    // tabla superior (todo opcional por ahora)
    serviceCatalogName?: string;
    templateName?: string;
    site?: SelectWithOther;
    owner?: string;
    reviewer?: string;
    observations?: string;
  };

  details: {
    rows: DetailRow[];
  };
};
