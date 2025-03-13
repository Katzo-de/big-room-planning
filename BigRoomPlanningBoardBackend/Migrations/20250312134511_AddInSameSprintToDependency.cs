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
            migrationBuilder.RenameColumn(
                name: "IterationType",
                table: "Events",
                newName: "InSameSprint");

            migrationBuilder.RenameColumn(
                name: "EditDependencyEvent_IterationType",
                table: "Events",
                newName: "EditDependencyEvent_InSameSprint");

            migrationBuilder.RenameColumn(
                name: "IterationType",
                table: "Dependencies",
                newName: "InSameSprint");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "InSameSprint",
                table: "Events",
                newName: "IterationType");

            migrationBuilder.RenameColumn(
                name: "EditDependencyEvent_InSameSprint",
                table: "Events",
                newName: "EditDependencyEvent_IterationType");

            migrationBuilder.RenameColumn(
                name: "InSameSprint",
                table: "Dependencies",
                newName: "IterationType");
        }
    }
}
