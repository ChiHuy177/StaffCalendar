using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CalendarWebsite.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddEventAttachments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "dbo");

            migrationBuilder.EnsureSchema(
                name: "Dynamic");

            migrationBuilder.CreateTable(
                name: "CustomWorkingTime",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkweekId = table.Column<long>(type: "bigint", nullable: false),
                    PersonalProfileId = table.Column<long>(type: "bigint", nullable: false),
                    MorningStart = table.Column<double>(type: "float", nullable: true),
                    MorningEnd = table.Column<double>(type: "float", nullable: true),
                    AfternoonStart = table.Column<double>(type: "float", nullable: true),
                    AfternoonEnd = table.Column<double>(type: "float", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModified = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomWorkingTime", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Data_HCQĐ07BM01",
                schema: "Dynamic",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserWorkflowId = table.Column<long>(type: "bigint", nullable: false),
                    NguoiDeNghi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BoPhan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayVaoLam = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LoaiPhepNam = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KPI = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TuNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DenNgay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TongSoNgayNghi = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    NgayYeuCau = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GhiChu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChucVu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SignatureImageRequest = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NghiPhep = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Data_HCQĐ07BM01", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DataOnly_APIaCheckIn",
                schema: "Dynamic",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserWorkflowId = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Method = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Check = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    EarlyIn = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    LateIn = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    EarlyOut = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    LateOut = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    InAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OutAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Wt = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    At = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Data = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataOnly_APIaCheckIn", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Department",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParentId = table.Column<long>(type: "bigint", nullable: true),
                    ChartCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ManagerId = table.Column<long>(type: "bigint", nullable: true),
                    DeptLevel = table.Column<int>(type: "int", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Telephone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Fax = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SiteName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Order = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModified = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true),
                    TitleEN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsHSSE = table.Column<bool>(type: "bit", nullable: true),
                    HSSEOrder = table.Column<int>(type: "int", nullable: true),
                    HOD = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Department", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MeetingRoom",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoomName = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeetingRoom", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PersonalProfile",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DepartmentId = table.Column<long>(type: "bigint", nullable: true),
                    ManagerId = table.Column<long>(type: "bigint", nullable: true),
                    PositionId = table.Column<long>(type: "bigint", nullable: true),
                    Gender = table.Column<bool>(type: "bit", nullable: true),
                    BirthDay = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StaffId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateOfHire = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Mobile = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageId = table.Column<long>(type: "bigint", nullable: true),
                    ImagePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SignatureUserName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SignaturePassword = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EnableSignature = table.Column<bool>(type: "bit", nullable: true),
                    UserStatus = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModified = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true),
                    SignatureTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SignatureEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserLevel = table.Column<int>(type: "int", nullable: true),
                    UserPosition = table.Column<long>(type: "bigint", nullable: true),
                    SignatureImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDarkMode = table.Column<bool>(type: "bit", nullable: true),
                    FlashSignatureImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Lang = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CoverImageId = table.Column<long>(type: "bigint", nullable: true),
                    CoverImagePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThumbnailImageId = table.Column<long>(type: "bigint", nullable: true),
                    ThumbnailImagePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EnableEmail = table.Column<bool>(type: "bit", nullable: true),
                    EnableNotification = table.Column<bool>(type: "bit", nullable: true),
                    CalendarChecked = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CalendarColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DailyView = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MonthlyView = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WeeklyView = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CalendarResourceSelected = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubDepartmentIds = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CalendarUserFillter = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsSyncCalendar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: true),
                    LastPasswordChanged = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AuthorizeAutomaticDigitalSigningEnabled = table.Column<bool>(type: "bit", nullable: true),
                    CalendarResourceChecked = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InternalPhone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsAllowedToUseTheCompanysDigitalSignature = table.Column<bool>(type: "bit", nullable: true),
                    ShowEventTheme = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalProfile", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkWeek",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsFullTime = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModified = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkWeek", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CalendarEvents",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EventType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RecurrentType = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    MeetingRoomId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CalendarEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CalendarEvents_MeetingRoom_MeetingRoomId",
                        column: x => x.MeetingRoomId,
                        principalSchema: "dbo",
                        principalTable: "MeetingRoom",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EventAttachments",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventId = table.Column<long>(type: "bigint", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FileType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FileSize = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventAttachments_CalendarEvents_EventId",
                        column: x => x.EventId,
                        principalSchema: "dbo",
                        principalTable: "CalendarEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EventAttendee",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventId = table.Column<long>(type: "bigint", nullable: false),
                    PersonalProfileId = table.Column<long>(type: "bigint", nullable: false),
                    ApprovalStatus = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventAttendee", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventAttendee_CalendarEvents_EventId",
                        column: x => x.EventId,
                        principalSchema: "dbo",
                        principalTable: "CalendarEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventAttendee_PersonalProfile_PersonalProfileId",
                        column: x => x.PersonalProfileId,
                        principalSchema: "dbo",
                        principalTable: "PersonalProfile",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CalendarEvents_MeetingRoomId",
                schema: "dbo",
                table: "CalendarEvents",
                column: "MeetingRoomId");

            migrationBuilder.CreateIndex(
                name: "IX_EventAttachments_EventId",
                table: "EventAttachments",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_EventAttendee_EventId",
                schema: "dbo",
                table: "EventAttendee",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_EventAttendee_PersonalProfileId",
                schema: "dbo",
                table: "EventAttendee",
                column: "PersonalProfileId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomWorkingTime",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Data_HCQĐ07BM01",
                schema: "Dynamic");

            migrationBuilder.DropTable(
                name: "DataOnly_APIaCheckIn",
                schema: "Dynamic");

            migrationBuilder.DropTable(
                name: "Department",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "EventAttachments");

            migrationBuilder.DropTable(
                name: "EventAttendee",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "WorkWeek",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "CalendarEvents",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "PersonalProfile",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "MeetingRoom",
                schema: "dbo");
        }
    }
}
