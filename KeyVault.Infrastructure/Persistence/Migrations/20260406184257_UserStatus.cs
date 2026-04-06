using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KeyVault.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UserStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "users");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "users",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "users");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "users",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);
        }
    }
}
