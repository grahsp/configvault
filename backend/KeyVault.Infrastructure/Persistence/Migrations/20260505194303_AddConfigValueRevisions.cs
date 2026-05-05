using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KeyVault.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddConfigValueRevisions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "Revision",
                table: "config_values",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateTable(
                name: "config_value_revisions",
                columns: table => new
                {
                    ConfigItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    EnvironmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Revision = table.Column<long>(type: "bigint", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    Value = table.Column<byte[]>(type: "bytea", nullable: false),
                    ModifiedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ModifiedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_config_value_revisions", x => new { x.ConfigItemId, x.EnvironmentId, x.Revision });
                });

            migrationBuilder.CreateIndex(
                name: "IX_config_value_revisions_ProjectId_ConfigItemId_EnvironmentId~",
                table: "config_value_revisions",
                columns: new[] { "ProjectId", "ConfigItemId", "EnvironmentId", "Revision" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "config_value_revisions");

            migrationBuilder.DropColumn(
                name: "Revision",
                table: "config_values");
        }
    }
}
