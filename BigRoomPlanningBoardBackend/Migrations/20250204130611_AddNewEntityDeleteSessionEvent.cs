using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BigRoomPlanningBoardBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddNewEntityDeleteSessionEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DeleteSessionId",
                table: "Events",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeleteSessionId",
                table: "Events");
        }
    }
}
