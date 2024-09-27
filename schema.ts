// Welcome to your schema
//   Schema driven development is Keystone's modus operandi
//
// This file is where we define the lists, fields and hooks for our data.
// If you want to learn more about how lists are configured, please read
// - https://keystonejs.com/docs/config/lists

import { list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";

// see https://keystonejs.com/docs/fields/overview for the full list of fields
//   this is a few common fields for an example
import {
  text,
  password,
  timestamp,
  select,
  file,
  integer,
  image,
  relationship,
} from "@keystone-6/core/fields";
import { type Lists } from ".keystone/types";
import { document } from "@keystone-6/fields-document";
import { KeystoneContext } from "@keystone-6/core/types";

export const isSuperAdmin = ({ session }: KeystoneContext["session"]) => {
  return session?.data?.role === "superAdmin";
};

export const lists = {
  // USER ENTITY //
  User: list({
    access: {
      operation: {
        query: ({ session }) => !!session,
        create: isSuperAdmin,
        update: isSuperAdmin,
        delete: isSuperAdmin,
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({
        validation: { isRequired: true },
        isIndexed: "unique",
      }),
      password: password({ validation: { isRequired: true } }),
      createdAt: timestamp({
        defaultValue: { kind: "now" },
      }),
      role: select({
        options: [
          { label: "Admin", value: "admin" },
          { label: "Super Administrateur", value: "superAdmin" },
        ],
        defaultValue: "admin",
        ui: {
          displayMode: "segmented-control",
        },
      }),
    },
    ui: {
      label: "Utilisateurs",
      plural: "Utilisateurs",
      isHidden: ({ session }) => session.data.role !== "superAdmin",
      listView: {
        initialColumns: ["name", "email", "createdAt", "role"],
      },
    },
  }),
  // TEXTE ENTITY //
  Texte: list({
    access: allowAll,
    fields: {
      title: text({
        validation: { isRequired: true },
        label: "Titre",
      }),
      subtitle: text({
        validation: { isRequired: true },
        label: "Sous-titre",
      }),
      content: document({
        formatting: true,
        links: true,
        layouts: [
          [1, 1],
          [1, 2],
          [2, 1],
        ],
        dividers: true,
        label: "Contenu du texte",
      }),
    },
  }),
  // IMAGE ENTITY //
  Image: list({
    access: allowAll,
    fields: {
      file: image({
        storage: "local",
      }),
      order: integer({
        validation: { isRequired: false, min: 1 },
        label: "Ordre d'affichage",
        ui: {
          description:
            "Définissez l'ordre d'affichage de l'image dans le carrousel.",
        },
      }),
      exposition: relationship({
        ref: "Exposition.images",
        many: false,
        label: "Exposition liée",
      }),
      sectionTravaux: relationship({
        ref: "SectionTravaux.image", // Référence au champ image de SectionTravaux
        label: "Section Travaux liée",
      }),
      sectionAbout: relationship({
        ref: "SectionAbout.image",
        label: "Section About liée",
      }),
      about: relationship({
        ref: "About.image",
        many: false,
        label: "About liée",
      }),
    },
    ui: {
      isHidden: isSuperAdmin,
    },
  }),
  // EXPOSTION ENTITY //
  Exposition: list({
    access: allowAll,
    fields: {
      title: text({
        validation: { isRequired: true },
        label: "Titre",
      }),

      subtitle: text({
        validation: { isRequired: true },
        label: "Sous-titre",
      }),
      content: document({
        formatting: true,
        links: true,
        layouts: [
          [1, 1],
          [1, 2],
          [2, 1],
        ],
        label: "Contenu de l'exposition",
      }),
      createdAt: timestamp({
        defaultValue: { kind: "now" },
        ui: {
          createView: { fieldMode: "hidden" },
          itemView: { fieldMode: "read" },
          listView: { fieldMode: "read" },
        },
      }),
      images: relationship({
        ref: "Image.exposition",
        many: true,
        label: "Images",
      }),
    },
  }),
  // TRAVAUX ENTITY //
  Travaux: list({
    access: allowAll,
    fields: {
      title: text({
        validation: { isRequired: true },
        label: "Titre",
      }),
      subtitle: text({
        validation: { isRequired: true },
        label: "Sous-titre",
      }),
      createdAt: timestamp({
        defaultValue: { kind: "now" },
        ui: {
          createView: { fieldMode: "hidden" },
          itemView: { fieldMode: "read" },
          listView: { fieldMode: "read" },
        },
      }),
      sections: relationship({
        ref: "SectionTravaux.travaux",
        many: true,
        label: "Sections du travail",
        ui: {
          displayMode: "cards",
          cardFields: ["section", "content", "image"],
          inlineCreate: { fields: ["section", "content", "image"] },
          inlineEdit: { fields: ["section", "content", "image"] },
          linkToItem: true, // Permet de naviguer vers les sections liées
          inlineConnect: true, // Permet de connecter des sections existantes
        },
      }),
    },
    ui: {
      label: "Travail",
      plural: "Travaux",
      listView: {
        initialColumns: ["title", "subtitle", "createdAt"],
      },
    },
  }),
  // SECTION TRAVAUX ENTITY //
  SectionTravaux: list({
    access: allowAll,
    fields: {
      content: document({
        formatting: true,
        links: true,
        layouts: [
          [1, 1],
          [1, 2],
          [2, 1],
        ],
        label: "Contenu de la section",
      }),
      section: select({
        options: [
          { label: "Première section", value: "1" },
          { label: "Deuxième section", value: "2" },
          { label: "Troisième section", value: "3" },
          { label: "Quatrième section", value: "4" },
        ],
        validation: { isRequired: true },
        label: "Section",
      }),
      travaux: relationship({
        ref: "Travaux.sections",
        many: false,
        label: "Travail lié",
      }),
      image: relationship({
        ref: "Image.sectionTravaux",
        label: "Image liée",
        ui: {
          displayMode: "cards",
          cardFields: ["file"],
          inlineCreate: { fields: ["file"] },
          inlineEdit: { fields: ["file"] },
        },
      }),
    },
    ui: {
      label: "Section d'un travail",
      plural: "Sections d'un travail",
    },
  }),
  // ABOUT ENTITY //
  About: list({
    access: {
      operation: {
        query: ({ session }) => !!session,
        create: ({ session }) => session?.data.role === "superAdmin",
        update: ({ session }) => !!session,
        delete: ({ session }) => session?.data.role === "superAdmin",
      },
    },
    fields: {
      image: relationship({
        ref: "Image.about",
        many: false,
        label: "Image de la page à propos",
        ui: {
          description: "Correspond à la première image de la page à propos",
          displayMode: "cards",
          cardFields: ["file"],
          inlineCreate: { fields: ["file"] },
          inlineEdit: { fields: ["file"] },
        },
      }),
      sections: relationship({
        ref: "SectionAbout",
        many: true,
        label: "Sections page à propos",
        ui: {
          description:
            "Correspond aux différentes sections de la page à propos",
          displayMode: "cards",
          cardFields: ["type", "content", "image"],
          inlineCreate: { fields: ["type", "content", "image"] },
          inlineEdit: { fields: ["type", "content", "image"] },
          linkToItem: true,
          inlineConnect: true,
        },
      }),
    },
    ui: {
      label: "Page à propos",
      plural: "Pages à propos",
    },
  }),
  // SECTION ABOUT ENTITY //
  SectionAbout: list({
    access: allowAll,
    fields: {
      type: select({
        options: [
          { label: "Biographie", value: "bio" },
          { label: "Processus de création", value: "process" },
          { label: "Démarche artistique", value: "démarcheArtistique" },
        ],
        validation: { isRequired: true },
        label: "Section visée",
      }),
      content: document({
        formatting: true, // Active le formatage (gras, italique, etc.)
        links: true, // Autorise l'insertion de liens
        layouts: [
          [1, 1], // Deux colonnes
          [1, 2], // Une grande et une petite colonne
          [2, 1], // Une petite et une grande colonne
        ],
        label: "Contenu de la section",
        ui: {
          description: "Correspond au contenu de la section ciblé",
        },
      }),
      image: relationship({
        ref: "Image.sectionAbout",
        many: false,
        label: "Image liée",
        ui: {
          displayMode: "cards",
          cardFields: ["file"],
          inlineCreate: { fields: ["file"] },
          inlineEdit: { fields: ["file"] },
        },
      }),
    },
    ui: {
      label: "Section de la page à propos",
      plural: "Sections de la page à propos",
    },
  }),
} satisfies Lists;
