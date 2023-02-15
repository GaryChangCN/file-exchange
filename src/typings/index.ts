export type Optional<T> = {
    [K in keyof T]: T[K] | undefined
}

export interface FileNode {
    isDir: boolean
    fileName: string
    relativePath: string
    size: number
    mtime: Date
}

export interface FileList {
    files: FileNode[]
    /** 当前相对路径 */
    current: string
    /** 父目录，可能为空 */
    parent?: string
}