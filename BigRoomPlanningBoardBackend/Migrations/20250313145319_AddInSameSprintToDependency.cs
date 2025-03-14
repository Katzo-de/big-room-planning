using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BigRoomPlanningBoardBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddInSameSprintToDependency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AddDependencyTicketEvent_DependantTicketId",
                table: "Events",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AddDependencyTicketEvent_DependencyId",
                table: "Events",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AddDependencyTicketEvent_DependencyTicketId",
                table: "Events",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "AddDependencyTicketEvent_InSameSprint",
                table: "Events",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AddOrUpdateSquadSprintStatsEvent_SprintId",
                table: "Events",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AddOrUpdateSquadSprintStatsEvent_SquadId",
                table: "Events",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AddPlannedPeriodEvent_PlannedPeriodId",
                table: "Events",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AddTicketEvent_ColumnOrder",
                table: "Events",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AddTicketEvent_PredecessorId",
                table: "Events",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AddTicketEvent_TicketId",
                table: "Events",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AddTicketEvent_Title",
                table: "Events",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EditDependencyEvent_DependencyId",
                table: "Events",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EditDependencyEvent_InSameSprint",
                table: "Events",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "InSameSprint",
                table: "Events",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "InSameSprint",
                table: "Dependencies",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddDependencyTicketEvent_DependantTicketId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "AddDependencyTicketEvent_DependencyId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "AddDependencyTicketEvent_DependencyTicketId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "AddDependencyTicketEvent_InSameSprint",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "AddOrUpdateSquadSprintStatsEvent_SprintId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "AddOrUpdateSquadSprintStatsEvent_SquadId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "AddPlannedPeriodEvent_PlannedPeriodId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "AddTicketEvent_ColumnOrder",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "AddTicketEvent_PredecessorId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "AddTicketEvent_TicketId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "AddTicketEvent_Title",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "EditDependencyEvent_DependencyId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "EditDependencyEvent_InSameSprint",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "InSameSprint",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "InSameSprint",
                table: "Dependencies");
        }
    }
}
