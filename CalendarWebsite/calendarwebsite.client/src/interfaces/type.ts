

export type User = {
    id: number;
    userWorkflowId: number;
    userId: string;
    method: number;
    check: number;
    earlyIn: number;
    lateIn: number;
    earlyOut: number;
    lateOut: number;
    inAt: Date;
    outAt: Date;
    wt: number;
    at: Date;
    fullName: string;
    data: string;
}
export type CheckinEvent = {
    id: number,
    title: string,
    start: number,
    end: number
}
export type foundUser = {
    userId: string,
    fullName: string
}
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
export function formatTime(dateString: string): string {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 7); // Cộng thêm 7 giờ

    const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    };
    return new Intl.DateTimeFormat('vi-VN', options).format(date);
}
export function formatDate(dateString: string): string {
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };

    return new Intl.DateTimeFormat('vi-VN', options).format(date);
}
