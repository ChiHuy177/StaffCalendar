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
export type AuthUser = {
    id: string;
    fullName: string;
    email: string;
}
export type foundUser = {
    userId: string,
    fullName: string
}
export type UserInfo = {
    emailAndName: string;
    personalProfileId: number;
}