export type CheckinEvent = {
    id: number,
    title: string,
    start: number,
    end: number
}
export type CheckinData = {
    id: number;
    userId?: string;
    inAt: Date;
    outAt: Date;
    date: Date;
    fullName?: string;
    loaiPhepNam?: string;
    attendant?: string;
    tuNgay?: Date;
    denNgay?: Date;
    tongSoNgayNghi?: number;
    ngayYeuCau?: Date;
    ghiChu?: string;
}
export interface WorkSchedule {
    id: number;
    workweekTitle: string;
    personalProfileId: number;
    fullName: string;
    morningStart: number | null;
    morningEnd: number | null;
    afternoonStart: number | null;
    afternoonEnd: number | null;
    createdBy: string;
    createdTime: Date | null;
    lastModified: Date | null;
    modifiedBy: string | null;
    isDeleted: boolean;
}
export interface WorkScheduleApiData {
    workweekId: number;
    personalProfileId: number;
    morningStart: number | null;
    morningEnd: number | null;
    afternoonStart: number | null;
    afternoonEnd: number | null;
    createdBy: string;
    createdTime: Date | null;
    lastModified: Date | null;
    modifiedBy: string | null;
    isDeleted: boolean;
}
export interface WorkScheduleDetail {
    workweekTitle: string;
    morningStart: number | null;
    morningEnd: number | null;
    afternoonStart: number | null;
    afternoonEnd: number | null;
}