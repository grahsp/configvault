using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KeyVault.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UserActivate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "users",
                newName: "DisplayName");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ActivatedAt",
                table: "users",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActivatedAt",
                table: "users");

            migrationBuilder.RenameColumn(
                name: "DisplayName",
                table: "users",
                newName: "Name");
        }
    }
}
