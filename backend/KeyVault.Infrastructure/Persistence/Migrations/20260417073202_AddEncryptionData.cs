using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KeyVault.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEncryptionData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM config_values");

            migrationBuilder.DropColumn(
                name: "Value",
                table: "config_values");

            migrationBuilder.CreateTable(
                name: "project_data_keys",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    Value = table.Column<byte[]>(type: "bytea", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_project_data_keys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_project_data_keys_projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_project_data_keys_ProjectId",
                table: "project_data_keys",
                column: "ProjectId");

            migrationBuilder.AddColumn<byte[]>(
                name: "Value",
                table: "config_values",
                type: "bytea",
                nullable: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "project_data_keys");

            migrationBuilder.DropColumn(
                name: "Value",
                table: "config_values");

            migrationBuilder.AddColumn<string>(
                name: "Value",
                table: "config_values",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false);
        }
    }
}
