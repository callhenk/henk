declare module 'react-file-drop' {
  import {
    ReactNode,
    DragEvent as ReactDragEvent,
    DragEventHandler as ReactDragEventHandler,
    ReactEventHandler,
  } from 'react';

  export type DropEffects = 'copy' | 'move' | 'link' | 'none';

  export interface FileDropProps {
    children: ReactNode;
    className?: string;
    targetClassName?: string;
    draggingOverFrameClassName?: string;
    draggingOverTargetClassName?: string;
    frame?:
      | Exclude<HTMLElementTagNameMap[keyof HTMLElementTagNameMap], HTMLElement>
      | HTMLDocument;
    onFrameDragEnter?: (event: DragEvent) => void;
    onFrameDragLeave?: (event: DragEvent) => void;
    onFrameDrop?: (event: DragEvent) => void;
    onDragOver?: ReactDragEventHandler<HTMLDivElement>;
    onDragLeave?: ReactDragEventHandler<HTMLDivElement>;
    onDrop?: (
      files: FileList | null,
      event: ReactDragEvent<HTMLDivElement>,
    ) => void;
    onTargetClick?: ReactEventHandler<HTMLDivElement>;
    dropEffect?: DropEffects;
  }

  export interface FileDropState {
    draggingOverFrame: boolean;
    draggingOverTarget: boolean;
  }

  export class FileDrop extends React.PureComponent<
    FileDropProps,
    FileDropState
  > {
    static isIE: () => boolean;
    static eventHasFiles: (
      event: DragEvent | React.DragEvent<HTMLElement>,
    ) => boolean;
  }
}
