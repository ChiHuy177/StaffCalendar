
export interface MeetingEvent {
    id?: number;

    title?: string | null;

    description?: string | null;

    eventType?: string | null;

    startTime: Date;

    endTime: Date;

    createdBy?: string | null;

    createdTime?: Date;

    recurrentType?: string;

    isDeleted?: boolean;

    meetingRoomId: number;
}

export interface RoomAvailabilityCheck {
    meetingRoomId: number;
    startTime: Date;
    endTime: Date
}
