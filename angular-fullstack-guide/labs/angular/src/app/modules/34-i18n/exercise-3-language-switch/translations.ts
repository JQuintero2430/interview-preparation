/** Nested dictionaries shared by both libraries; French lacks `cart.empty` on purpose (the fallback criterion). */
export interface LabM34Dictionary {
  [key: string]: string | LabM34Dictionary;
}

export const LAB_M34_ROOT_FILES: Record<string, LabM34Dictionary> = {
  en: {
    cart: { title: 'Your cart', empty: 'Your cart is empty' },
    nav: { admin: 'Open admin' },
    form: { name: 'Name' },
    validation: { required: 'This field is required.' },
  },
  fr: {
    cart: { title: 'Votre panier' },
    nav: { admin: "Ouvrir l'admin" },
    form: { name: 'Nom' },
    validation: { required: 'Ce champ est obligatoire.' },
  },
};

/** The admin files hold bare keys: Transloco prefixes them with the scope name, the child service does not. */
export const LAB_M34_ADMIN_FILES: Record<string, LabM34Dictionary> = {
  en: { title: 'Admin area' },
  fr: { title: 'Espace admin' },
};
