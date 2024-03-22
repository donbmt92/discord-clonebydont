import { create } from "zustand";

export type ModalType = "createServer";
// | "EditServer" | "

/* The `interface ModalStore` in the TypeScript code snippet defines the structure of the `ModalStore`
object. Here's what each property in the interface represents: */
interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  onOpen: (type: ModalType) => void;
  onClose: () => void;
}

/* `useModal` is a custom hook created using Zustand library in TypeScript. It provides a
state management solution for handling modals in an application. The `useModal` hook
returns an object with properties `type`, `isOpen`, `onOpen`, and `onClose`. */
export const  useModal = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  onOpen: (type) => set({ isOpen: true, type }),
  onClose: () => set({ isOpen: false, type: null }),
}));
