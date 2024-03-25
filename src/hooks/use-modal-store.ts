import { Server } from "@prisma/client";
import { create } from "zustand";

export type ModalType =
  | "createServer"
  | "invite"
  | "editServer"
  | "members"
  | "createChannel"
  | "leaveServer"
  | "deleteServer";

interface ModalData {
  server?: Server;
}

/* The `interface ModalStore` in the TypeScript code snippet defines the structure of the `ModalStore`
object. Here's what each property in the interface represents: */
interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

/* `useModal` is a custom hook created using Zustand library in TypeScript. It provides a
state management solution for handling modals in an application. The `useModal` hook
returns an object with properties `type`, `isOpen`, `onOpen`, and `onClose`. */
export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ isOpen: false, type: null }),
}));
