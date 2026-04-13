using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KeyVault.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddConfigValues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "config_values",
                columns: table => new
                {
                    ConfigItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    EnvironmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Value = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_config_values", x => new { x.ConfigItemId, x.EnvironmentId });
                    table.ForeignKey(
                        name: "FK_config_values_config_items_ConfigItemId",
                        column: x => x.ConfigItemId,
                        principalTable: "config_items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "config_values");
        }
    }
}
