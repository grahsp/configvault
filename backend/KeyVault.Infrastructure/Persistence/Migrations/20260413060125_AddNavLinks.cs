using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KeyVault.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddNavLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_config_values_EnvironmentId",
                table: "config_values",
                column: "EnvironmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_config_items_projects_ProjectId",
                table: "config_items",
                column: "ProjectId",
                principalTable: "projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_config_values_project_environments_EnvironmentId",
                table: "config_values",
                column: "EnvironmentId",
                principalTable: "project_environments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_config_items_projects_ProjectId",
                table: "config_items");

            migrationBuilder.DropForeignKey(
                name: "FK_config_values_project_environments_EnvironmentId",
                table: "config_values");

            migrationBuilder.DropIndex(
                name: "IX_config_values_EnvironmentId",
                table: "config_values");
        }
    }
}
