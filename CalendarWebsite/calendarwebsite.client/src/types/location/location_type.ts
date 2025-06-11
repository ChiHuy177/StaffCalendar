export type Department = {
    id: number;
    title?: string;
    code?: string;
    description?: string;
    parentId?: number;
    chartCode?: string;
    managerId?: number;
    deptLevel?: number;
    email?: string;
    telephone?: string;
    fax?: string;
    address?: string;
    siteName?: string;
    order?: number;
    createdBy?: string;
    createdTime?: Date;
    lastModified?: Date;
    modifiedBy?: string;
    isDeleted?: boolean;
    titleEN?: string;
    isHSSE?: boolean;
    hsseOrder?: number;
    hod?: string;
}


export type MeetingRoom = {
    id: number;
    roomName: string;
}